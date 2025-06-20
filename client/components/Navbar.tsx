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
  UserButton
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import ConnectionStatus from "@/components/User/ConnectionStatus";
import { SafeLocalStorage } from "@/lib/utils/SafeLocalStorage";
import webSocketService from "@/lib/WebSocketService";
import { useClerkAuth } from "@/hooks/use-clerk-auth";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState<string>('');
  const pathname = usePathname();
  const router = useRouter();
  const isChatPage = pathname?.includes('/user/chat');
  const [navbarHeight, setNavbarHeight] = useState(0);
  const { isSignedIn, user, performLogoutCleanup } = useClerkAuth();

  useEffect(() => {
    if (isChatPage) {
      const storedUsername = SafeLocalStorage.getItem('username');
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
      checkConnection(); return () => {
        clearInterval(interval);
      };
    }
  }, [isChatPage]);

  const handleLogout = () => {
    performLogoutCleanup();
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const updateNavbarHeight = () => {
      const navElement = document.getElementById('navbar');
      if (navElement) {
        setNavbarHeight(navElement.offsetHeight);
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);

    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, [isMenuOpen]);


  return (
    <>
      <header id="navbar" className="fixed top-0 left-0 w-full z-50 border-b border-container backdrop-blur-md">
        <nav className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
          {/* Logo Section */}
          <Link href="/" className="flex items-center">
            <Image src={logo} alt="FreeFlow Logo" width={40} height={40} />
            <span className="text-2xl text-gray-600 font-semibold">FreeFlow</span>
          </Link>

          {/* Mobile: Hamburger + User Icon */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="text-white"
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
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">

            {/* {username && <span className="text-gray-600">{username}</span>}
            <ConnectionStatus /> */}
            {/* <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-whisper-purple cursor-pointer hover:bg-whisper-purple/90"
            >
              Logout
            </Button> */}
            <SignedIn>
              {!isChatPage && (
                <a
                  href="/user/chat"
                  className="text-black bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Go Private Now
                </a>
              )}
              <a
                href="/group-chat"
                className="text-white bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Group Chat
              </a>
              <a
                href="/video-call"
                className="text-white bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Video Call
              </a>
            </SignedIn>
            {/* <ThemeToggle /> */}
            <SignedOut>
              <Button variant="default" className="cursor-pointer" onClick={() => router.push('/p2p')}>
                Go Private
              </Button>
              <Button variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </nav>
        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <>
            <div className="md:hidden bg-background px-6 py-3 space-y-2">
              {/* <Button
                    variant="outline"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full cursor-pointer bg-whisper-purple hover:bg-whisper-purple/90"
                  >
                    Logout
                  </Button> */}

              <SignedIn>
                {!isChatPage && (
                  <Link
                    href="/p2p"
                    className="block text-center text-black bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-sm transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go Private
                  </Link>
                )}
                <a
                  href="/group-chat"
                  className="block text-white bg-secondary hover:bg-secondary/80 px-4 py-2 rounded-md text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Group Chat
                </a>
                <a
                  href="/video-call"
                  className="block text-white bg-accent hover:bg-accent/80 px-4 py-2 rounded-md text-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Video Call
                </a>
              </SignedIn>
              <div className="flex justify-end gap-6 items-center mt-2">
                {/* <ThemeToggle /> */}
                <SignedOut>
                  {!isChatPage && (
                    <Link
                      href="/p2p"
                      className="text-black bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Go Private
                    </Link>
                  )}
                  <Link href="/sign-in" className="text-white underline">
                    Sign in
                  </Link>
                </SignedOut>
                {/* <SignedIn>
                  <UserButton />
                </SignedIn> */}
              </div>
            </div>
          </>
        )}
      </header>
      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="spacer" style={{ height: `${navbarHeight}px` }}></div>
    </>
  );
};

export default Navbar;