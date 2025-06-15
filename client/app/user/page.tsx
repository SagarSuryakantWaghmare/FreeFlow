"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';

export default function UserRedirect() {
  const router = useRouter();
  
  useEffect(() => {    // Check if user is already logged in
    const username = SafeLocalStorage.getItem('username');
    const userId = SafeLocalStorage.getItem('userId');
    
    if (username && userId) {
      // If logged in, redirect to chat
      router.push('/user/chat');
    } else {
      // If not logged in, redirect to sign-in
      router.push('/simple-sign-in');
    }
  }, [router]);
  
  // Return a loading state while redirecting
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="text-2xl font-semibold mb-4">Redirecting...</div>
        <div className="w-16 h-16 border-4 border-primary border-solid rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
}