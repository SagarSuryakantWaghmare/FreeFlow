"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/1.png";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="container">
      <nav className="navbar blur-box display-flex justify-between align-center">
        <div className="navbar-logo">
          <Image src={logo} alt="FreeFlow Logo" width={50} height={50} />
          <span className="text-4xl">FreeFlow</span>
        </div>

        {/* Nav Links */}
        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          <Link href="/about">About</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/faq">FAQs</Link>
        </div>

        {/* CTA Button */}
        <Link href="/get-started" className="navbar-btn">
          Get Started
        </Link>
      </nav>
    </main>
  );
};

export default Navbar;
