import { Link } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

function GetPro() {
  const startCheckout = async () => {
    try {
      const { data } = await api.post("payments/create-session/");
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      if (error) alert(error.message);
    } catch (e) {
      console.error(e);
      alert("Failed to start payment. Check console.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Upgrade to Peerza <span className="text-indigo-600">Pro</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Unlock unlimited learning potential and premium features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900">Free</h3>
          <p className="mt-4 text-gray-500">Perfect for getting started.</p>
          <div className="mt-6 text-5xl font-extrabold text-gray-900">$0</div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> 2 Skills Limit
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> Basic Search
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> 1-on-1 Video Calls
            </li>
          </ul>
          <Link
            to="/dashboard"
            className="mt-8 block w-full bg-indigo-50 text-indigo-700 font-bold py-3 px-6 rounded-xl text-center hover:bg-indigo-100 transition"
          >
            Current Plan
          </Link>
        </div>

        {/* Pro Plan (Highlighted) */}
        <div className="bg-indigo-600 rounded-2xl shadow-xl p-8 flex flex-col transform scale-105 relative">
          <div className="absolute top-0 right-0 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl uppercase tracking-wide">
            Most Popular
          </div>
          <h3 className="text-2xl font-bold text-white">Pro</h3>
          <p className="mt-4 text-indigo-100">For serious learners.</p>
          <div className="mt-6 text-5xl font-extrabold text-white">
            $5<span className="text-xl font-medium text-indigo-200">/mo</span>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center text-white">
              <span className="mr-2 text-yellow-400">✔</span>{" "}
              <strong>Unlimited Skills</strong>
            </li>
            <li className="flex items-center text-white">
              <span className="mr-2 text-yellow-400">✔</span> Verified Badge 🏅
            </li>
            <li className="flex items-center text-white">
              <span className="mr-2 text-yellow-400">✔</span> Priority Search
              Ranking
            </li>
            <li className="flex items-center text-white">
              <span className="mr-2 text-yellow-400">✔</span> Group Classes
            </li>
          </ul>
          <button
            onClick={startCheckout}
            className="mt-8 block w-full bg-white text-indigo-600 font-bold py-3 px-6 rounded-xl text-center hover:bg-gray-50 transition shadow-lg"
          >
            Upgrade Now
          </button>
        </div>

        {/* Team Plan */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900">Campus</h3>
          <p className="mt-4 text-gray-500">For university clubs.</p>
          <div className="mt-6 text-5xl font-extrabold text-gray-900">$29</div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> Everything in Pro
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> Admin Dashboard
            </li>
            <li className="flex items-center text-gray-600">
              <span className="mr-2 text-green-500">✔</span> Bulk Student Import
            </li>
          </ul>
          <button className="mt-8 block w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-xl text-center hover:bg-gray-900 transition">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
}

export default GetPro;
