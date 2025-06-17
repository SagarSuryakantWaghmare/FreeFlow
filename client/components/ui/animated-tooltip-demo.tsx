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
    image:Sagar,
  },
  {
    id: 3,
    name: "Aakash",
    designation: "Java Backend Developer",
    image:
      Sagar,
  },
];

export default function DeveloperTooltip() {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      <AnimatedTooltip items={developers} />
    </div>
  );
}
