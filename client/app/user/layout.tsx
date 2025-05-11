import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/Navbar';
import { ClerkProvider } from '@clerk/nextjs';
import { WebRTCProvider } from '@/providers/webrtc-provider';
import '../p2p-styles.css';

export const metadata: Metadata = {
  title: "FreeFlow - Peer to Peer Communication",
  description: "A seamless, obstacle-free peer-to-peer communication platform",
};

export default function UserSpecificLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <WebRTCProvider>
          <div className="flex min-h-screen flex-col max-w-[1420px] mx-auto">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
          </div>
          <Toaster />
        </WebRTCProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}