import json
import stripe
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import User  # we’ll flip is_pro after success

stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Creates a one-time Checkout Session for Peerza Pro.
    """
    try:
        # Safety: Ensure user has an email; Stripe likes it for receipts & matching
        email = request.user.email or None

        session = stripe.checkout.Session.create(
            mode='payment',
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': 'Peerza Pro Plan'},
                    'unit_amount': 499 * 100,  # $4.99 in cents
                },
                'quantity': 1,
            }],
            success_url='http://localhost:5173/pro?success=true',
            cancel_url='http://localhost:5173/pro?canceled=true',
            customer_email=email,
            metadata={
                'user_id': str(request.user.id),
                'username': request.user.username,
            }
        )
        return Response({'sessionId': session.id})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    (Recommended) Marks user as Pro after successful payment.
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

    try:
        if webhook_secret:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        else:
            # Dev fallback (less secure)
            event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session.get('metadata', {}).get('user_id')  # reliable because we set it above
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                user.is_pro = True
                user.save()
            except User.DoesNotExist:
                pass

    return Response(status=200)
