import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Anton } from "next/font/google";
import { Inter } from 'next/font/google';
import {
  ClerkProvider,
} from '@clerk/nextjs'
import Navbar from "@/components/Navbar";
// const anton = Anton({
//   weight: "400",
//   variable: "--font-anton",
//   subsets: ["latin"],
// });

// const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
// const bebasNeue = Bebas_Neue({
//   weight: "400",
//   variable: "--font-bebas",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "FreeFlow - Peer to Peer Communication",
  description: "A seamless, obstacle-free peer-to-peer communication platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`antialiased`}>
          <Navbar/>  
          {children}
        </body>
      </html>
    </ClerkProvider>

  );
}
