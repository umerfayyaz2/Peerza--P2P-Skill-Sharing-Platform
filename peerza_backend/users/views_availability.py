from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from datetime import time
from .models import Availability, Meeting
from .serializers import AvailabilitySerializer


class AvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Availability.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # ✅ GET /api/availability/<peer_id>/user/
    @action(detail=True, methods=['get'])
    def user(self, request, pk=None):
        slots = Availability.objects.filter(user__id=pk)
        meetings = Meeting.objects.filter(
            Q(host__id=pk) | Q(guest__id=pk),
            status__iexact="Accepted"
        )

        result = []
        for slot in slots:
            # Default slot state
            is_booked = False

            for meeting in meetings:
                # ✅ Safe date handling
                meeting_start = meeting.start_datetime.time() if meeting.start_datetime else None
                meeting_end = meeting.end_datetime.time() if meeting.end_datetime else None

                # Only process if both times exist
                if meeting_start and meeting_end:
                    meeting_day = meeting.start_datetime.strftime("%A").upper()

                    # ✅ Check same weekday and overlapping time
                    if (
                        meeting_day == slot.day_of_week.upper()
                        and not (meeting_end <= slot.start_time or meeting_start >= slot.end_time)
                    ):
                        is_booked = True
                        break

            result.append({
                "id": slot.id,
                "day_of_week": slot.day_of_week,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "is_booked": is_booked,
            })

        return Response(result)
