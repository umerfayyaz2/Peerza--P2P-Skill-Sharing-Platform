function About() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Peerza</h1>
      <div className="prose prose-indigo text-gray-600">
        <p className="mb-4">
          Peerza was born from a simple observation:{" "}
          <strong>Students have immense untapped knowledge.</strong>
        </p>
        <p className="mb-4">
          In universities across the world, someone is struggling with a subject
          that another student has mastered. Peerza connects these two people.
        </p>
        <p className="mb-4">
          We believe that financial barriers shouldn't stop learning. By
          bartering skills instead of paying tuition, we create a community of
          mutual growth.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          Our Mission
        </h2>
        <p>
          To democratize academic support and build the world's largest
          peer-to-peer learning network.
        </p>
      </div>
    </div>
  );
}

export default About;
