import React from "react";
import Image from "next/image";

const HeroSection = () => {
  return (
    <>
      <section className="h-screen flex flex-col items-center justify-center text-center px-4">

        <div className="absolute inset-0 hidden md:block z-0">
          <Image
            src="/Home/Hero/blob-scene-horizontal.jpg" // Replace with your desktop image filename
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Mobile Background */}
        <div className="absolute inset-0 block md:hidden z-0">
          <Image
            src="/Home/Hero/blob-scene-vertical.jpg" // Replace with your mobile image filename
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50 z-0"></div>

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
