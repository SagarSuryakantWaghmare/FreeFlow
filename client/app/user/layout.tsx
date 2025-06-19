import type { Metadata } from 'next';
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
  return <div className="">{children}</div>;
}