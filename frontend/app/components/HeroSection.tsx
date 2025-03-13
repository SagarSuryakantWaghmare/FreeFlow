import React from "react";
const HeroSection = () => {
  return (
    <>
    <section className="hero glow-effect">
    
      <span className="hero-tagline">🔗 Connect Seamlessly, Securely</span>

      {/* Heading */}
      <h1 className="hero-heading">
        Peer-to-Peer Communication, <br /> Without Barriers.
      </h1>

      {/* Subtext */}
      <p className="hero-subtext">
        FreeFlow lets you communicate securely and instantly, without centralized 
        servers. Experience a truly **decentralized** way to connect.
      </p>

      {/* Call to Action */}
      <button className="hero-cta glow">Start Communicating</button>
    </section>
    </>
  );
};

export default HeroSection;
