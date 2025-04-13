"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/1.png";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <main className="navbar-container">
      <nav className="navbar blur-box display-flex justify-between align-center">
        <div className="navbar-logo">
          <Image src={logo} alt="FreeFlow Logo" width={50} height={50} />
          <span className="text-4xl">FreeFlow</span>
        </div>

        {/* Hamburger Menu Icon */}
        <button 
          className="hamburger-menu" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="hamburger-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            {isMenuOpen ? (
              <path
                fill="currentColor"
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            ) : (
              <path
                fill="currentColor"
                d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
              />
            )}
          </svg>
        </button>

        {/* Nav Links */}
        <div className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
          <Link href="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
          <Link href="/features" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
          <Link href="/faq" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
          
          {/* Mobile CTA Button */}
          <Link 
            href="/get-started" 
            className="navbar-btn mobile-cta"
            onClick={() => setIsMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>

        {/* Desktop CTA Button */}
        <Link href="/get-started" className="navbar-btn desktop-cta">
          Get Started
        </Link>
      </nav>
    </main>
  );
};

export default Navbar;