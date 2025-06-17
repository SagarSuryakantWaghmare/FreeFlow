import React from "react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function BackgroundBeamsWithCollisionDemo() {
  return (
    <BackgroundBeamsWithCollision className="bg-gradient-to-br from-white via-purple-50/30 to-white dark:from-[hsl(224,71.4%,4.1%)] dark:via-[hsl(263.4,70%,50.4%)]/5 dark:to-[hsl(224,71.4%,4.1%)]">
      <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
        What&apos;s cooler than P2P?{" "}
        <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-[hsl(263.4,70%,50.4%)] via-purple-600 to-violet-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            <span className="">Exploding connections.</span>
          </div>
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] via-purple-600 to-violet-500 py-4">
            <span className="">Exploding connections.</span>
          </div>
        </div>
      </h2>
    </BackgroundBeamsWithCollision>
  );
}
