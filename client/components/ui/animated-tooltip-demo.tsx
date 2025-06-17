"use client";
import React from "react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import Sagar from "@/public/Photos/sagar.jpg";

const developers = [
  {
    id: 1,
    name: "Sagar Suryakant Waghmare",
    designation: "Full Stack Developer",
    image: Sagar,
  },
  {
    id: 2,
    name: "Atharva",
    designation: "Full Stack Developer",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Aakash",
    designation: "Java Backend Developer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
  },
];

export default function DeveloperTooltip() {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      <AnimatedTooltip items={developers} />
    </div>
  );
}
