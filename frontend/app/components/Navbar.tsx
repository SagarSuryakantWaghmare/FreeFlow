"use client";

import { useState } from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className="container">
    <nav className="navbar blur-box display-flex justify-between align-center">
      <div className="navbar-logo">
        <img src="/logo.png" alt="FreeFlow Logo" width="30" />
        <span>FreeFlow</span>
      </div>

      {/* Nav Links */}
      <div className={`navbar-links ${isOpen ? "open" : ""}`}>
        <Link href="/about">About</Link>
        <Link href="/features">Features</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/faq">FAQs</Link>
      </div>

      {/* CTA Button */}
      <Link href="/get-started" className="navbar-btn">Get Started</Link>

      {/* Mobile Menu Button */}
      <div className="menu-icon" onClick={() => setIsOpen(!isOpen)}>
        <span>☰</span>
      </div>
    </nav>
    </main>
  );
};

export default Navbar;
