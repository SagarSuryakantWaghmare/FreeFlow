"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/1.png";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname, useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import ConnectionStatus from "@/components/User/ConnectionStatus";
import webSocketService from "@/lib/WebSocketService";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const isChatPage = pathname?.includes('/user/chat');

  useEffect(() => {
    if (isChatPage) {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }

      // Update connection status from WebSocketService if available
      const checkConnection = () => {
        if (webSocketService) {
          setIsConnected(webSocketService.isConnected());
        }
      };

      const interval = setInterval(checkConnection, 2000);
      checkConnection();

      return () => {
        clearInterval(interval);
      };
    }
  }, [isChatPage]);

  const handleLogout = () => {
    if (webSocketService) {
      webSocketService.disconnect();
    }
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }; return (
    <header className="fixed container top-0 left-0 w-full z-50 border-b border-container backdrop-blur-md">
      <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="FreeFlow Logo" width={40} height={40} />
          <span className="text-2xl text-gray-600 font-semibold">FreeFlow</span>
        </Link>

        {/* Hamburger Icon (Mobile Only) */}
        <button
          className="md:hidden text-white"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" width={28} height={28}>
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

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isChatPage ? (
            <>
              {username && <span className="text-gray-600">{username}</span>}
              <ConnectionStatus />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-whisper-purple hover:bg-whisper-purple/90 text-white"
              >
                Logout
              </Button>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Link
                href="/p2p"
                className="text-white bg-[rgb(116,76,197)] hover:bg-[rgb(96,60,180)] px-4 py-2 rounded-md text-sm transition-colors"
              >
                Go Private
              </Link>
              <ThemeToggle />
              <SignedOut>
                <Button variant="outline">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </>
          )}
        </div>
      </nav>      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <>
          <div className="md:hidden bg-black px-6 py-3 space-y-2">
            {isChatPage ? (
              <>
                {username && <span className="block text-white mb-2">{username}</span>}
                <div className="mb-2">
                  <ConnectionStatus />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full cursor-pointer bg-whisper-purple hover:bg-whisper-purple/90"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/p2p"
                  className="block text-white bg-[rgb(116,76,197)] hover:bg-[rgb(96,60,180)] px-4 py-2 rounded-md text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Go Private
                </Link>
                <div className="flex justify-between items-center mt-2">
                  <ThemeToggle />
                  <SignedOut>
                    <Link href="/sign-in" className="text-white underline">
                      Sign in
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
