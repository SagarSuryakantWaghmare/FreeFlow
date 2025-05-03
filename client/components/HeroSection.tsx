import React from "react";

const HeroSection = () => {
  return (
    <>
      <section className="h-screen flex flex-col items-center justify-center text-center px-4">
        <span className="bg-purple-600/20 text-white py-2 px-4 rounded-full text-sm">
          🔗 Connect Seamlessly, Securely
        </span>

        {/* Heading */}
        <h1 className="text-white text-5xl mt-5 max-w-[800px]">
          Peer-to-Peer Communication, <br /> Without Barriers.
        </h1>

        {/* Subtext */}
        <p className="text-lg text-white/70 mt-3 max-w-[600px]">
          FreeFlow lets you communicate securely and instantly, without centralized
          servers. Experience a truly <strong>decentralized</strong> way to connect.
        </p>

        {/* Call to Action */}
        <button className="mt-6 py-3 px-6 bg-purple-500 rounded-full transition-colors duration-300 hover:bg-purple-600">
          Start Communicating
        </button>
      </section>
    </>
  );
};

export default HeroSection;
