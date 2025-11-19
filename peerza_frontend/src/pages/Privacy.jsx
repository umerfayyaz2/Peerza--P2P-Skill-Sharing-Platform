function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last Updated: November 2025</p>

      <div className="space-y-6 text-gray-600">
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            1. Information We Collect
          </h2>
          <p>
            We collect your username, email, and the skills you list on your
            profile. We do not record video calls.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            2. How We Use Data
          </h2>
          <p>
            Your data is used solely to match you with other peers and improve
            the matchmaking algorithm.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            3. Data Security
          </h2>
          <p>
            We use industry-standard encryption to protect your account
            information.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;
