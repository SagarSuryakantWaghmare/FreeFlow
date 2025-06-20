import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function TextHoverEffectDemo() {
  return (    <div className="h-[25 rem] flex items-center justify-center bg-black dark:from-[hsl(224,71.4%,4.1%)] dark:via-[hsl(263.4,70%,50.4%)]/5 dark:to-[hsl(224,71.4%,4.1%)] relative overflow-hidden">
      <div className="relative z-10 w-full max-w-8xl mx-auto">
        <TextHoverEffect text="FREEFLOW" />
      </div>
    </div>
  );
}