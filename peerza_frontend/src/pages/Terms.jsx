function Terms() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Terms of Service
      </h1>

      <div className="space-y-6 text-gray-600">
        <p>By using Peerza, you agree to the following terms:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>You will treat all peers with respect and professionalism.</li>
          <li>
            You will not use the platform for illegal activities or harassment.
          </li>
          <li>
            Peerza is not responsible for the quality of instruction provided by
            peers.
          </li>
          <li>
            We reserve the right to ban accounts that violate our community
            guidelines.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Terms;
