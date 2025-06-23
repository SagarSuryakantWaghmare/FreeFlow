"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/1.png";
import { usePathname, useRouter } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  UserButton
} from "@clerk/nextjs";
import { Button } from "./ui/button";
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

  return (
    <>
      <header id="navbar" className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-white/20 dark:border-gray-800/50 transition-all duration-300">
        <nav className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image 
                src={logo} 
                alt="FreeFlow Logo" 
                width={40} 
                height={40} 
                className="transition-transform duration-300 group-hover:scale-110 rounded-lg shadow-sm"
              />
            </div>
            <span className="text-2xl text-gray-600 dark:text-gray-300 font-semibold tracking-tight transition-colors duration-300 group-hover:text-gray-800 dark:group-hover:text-white">
              FreeFlow
            </span>
          </Link>          {/* Mobile: Hamburger + User Icon */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              className="p-2 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-black/40 hover:text-gray-900 dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
            >
              <svg viewBox="0 0 24 24" width={20} height={20} className="transition-transform duration-300">
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
              <div className="p-1 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <UserButton />
              </div>
            </SignedIn>
          </div>          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <SignedIn>              {!isChatPage && (
                <Link
                  href="/user/chat"
                  className="relative group px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gradient-to-r from-primary/10 to-primary/20 hover:text-white rounded-xl border border-primary/20 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm"
                >
                  <span className="relative z-10">Go Private Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                </Link>
              )}              <Link
                href="/group-chat"
                className="relative group px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/10 dark:bg-black/20 hover:text-white rounded-xl border border-white/20 dark:border-gray-700/50 hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                <span className="relative z-10">Group Chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/video-call"
                className="relative group px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/10 dark:bg-black/20 hover:text-white rounded-xl border border-white/20 dark:border-gray-700/50 hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 backdrop-blur-sm"
              >
                <span className="relative z-10">Video Call</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
              </Link>
            </SignedIn>
            
            <SignedOut>
              <Button 
                variant="default" 
                className="cursor-pointer px-6 py-2.5 text-sm font-medium rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105" 
                onClick={() => router.push('/p2p')}
              >
                Go Private
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-2.5 text-sm font-medium rounded-xl border-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-black/40 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-lg"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </SignedOut>
            
            <SignedIn>
              {/* <div className="ml-2 p-1 rounded-xl bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300"> */}
                <UserButton />
              {/* </div> */}
            </SignedIn>
          </div>
        </nav>        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-white/20 dark:border-gray-800/50 shadow-lg animate-in slide-in-from-top-2 duration-300">
            <div className="px-4 py-6 space-y-3 max-w-7xl mx-auto">              <SignedIn>
                {!isChatPage && (
                  <Link
                    href="/user/chat"
                    className="relative group block w-full text-center font-medium text-gray-700 dark:text-white bg-gradient-to-r from-primary/10 to-primary/20 hover:text-white px-6 py-3 rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-lg border border-primary/20 hover:border-primary transform hover:scale-[1.02]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">Go Private</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  </Link>
                )}
                <Link
                  href="/group-chat"
                  className="relative group block w-full text-center font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-black/40 hover:text-white px-6 py-3 rounded-xl border border-white/30 dark:border-gray-600/50 hover:border-secondary transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm transform hover:scale-[1.02]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Group Chat</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                </Link>
                <Link
                  href="/video-call"
                  className="relative group block w-full text-center font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-black/40 hover:text-white px-6 py-3 rounded-xl border border-white/30 dark:border-gray-600/50 hover:border-accent transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm transform hover:scale-[1.02]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Video Call</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-purple-900 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                </Link>
              </SignedIn>
              
              <SignedOut>
                <div className="space-y-3">
                  {!isChatPage && (
                    <Link
                      href="/p2p"
                      className="block w-full text-center font-medium text-white bg-primary hover:bg-primary/90 px-6 py-3 rounded-xl text-sm transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Go Private
                    </Link>
                  )}
                  <Link 
                    href="/sign-in" 
                    className="block w-full text-center font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-black/40 hover:bg-white/30 dark:hover:bg-black/60 px-6 py-3 rounded-xl border border-white/30 dark:border-gray-600/50 transition-all duration-300 shadow-sm hover:shadow-lg backdrop-blur-sm transform hover:scale-[1.02]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        )}</header>
      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="h-[72px] sm:h-[80px]" aria-hidden="true"></div>
    </>
  );
};

export default Navbar;