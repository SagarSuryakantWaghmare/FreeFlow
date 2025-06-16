"use client";

import { useUser } from '@clerk/nextjs';
import { useEffect, useCallback } from 'react';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';

/**
 * Enhanced Clerk authentication hook that automatically manages localStorage
 * for user data on login/logout
 */
export function useClerkAuth() {
  const { isSignedIn, isLoaded, user } = useUser();

  // Helper function to extract username from Clerk user
  const extractUserName = useCallback((user: any): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.emailAddresses && user.emailAddresses[0]) {
      const email = user.emailAddresses[0].emailAddress;
      return email.split('@')[0];
    }
    return 'User';
  }, []);

  // Auto-save user data on login
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const userId = user.id;
      const userName = extractUserName(user);

      // Save user data to localStorage
      SafeLocalStorage.setItem('userId', userId);
      SafeLocalStorage.setItem('username', userName);

      console.log('User logged in, saved to localStorage:', { userId, userName });
    } else if (isLoaded && !isSignedIn) {
      // User logged out or not signed in - clear all user data
      performLogoutCleanup();
    }
  }, [isSignedIn, isLoaded, user, extractUserName]);

  // Comprehensive logout cleanup
  const performLogoutCleanup = useCallback(() => {
    console.log('Performing logout cleanup...');
    
    // User identification
    SafeLocalStorage.removeItem('userId');
    SafeLocalStorage.removeItem('username');
    
    // Chat related data
    SafeLocalStorage.removeItem('messages');
    SafeLocalStorage.removeItem('connectedUsers');
    SafeLocalStorage.removeItem('connectionHistory');
    SafeLocalStorage.removeItem('blacklistedUsers');
    
    // Group chat data
    SafeLocalStorage.removeItem('groups');
    SafeLocalStorage.removeItem('groupNotifications');
    SafeLocalStorage.removeItem('groupRequests');
    SafeLocalStorage.removeItem('currentGroup');
    
    // Video call data
    SafeLocalStorage.removeItem('videoRooms');
    SafeLocalStorage.removeItem('videoSettings');
    SafeLocalStorage.removeItem('lastVideoRoom');
    
    // P2P related data
    SafeLocalStorage.removeItem('p2pConnections');
    SafeLocalStorage.removeItem('peerSettings');
    
    // Application state
    SafeLocalStorage.removeItem('appSettings');
    SafeLocalStorage.removeItem('lastRoute');
    SafeLocalStorage.removeItem('sessionData');
    
    console.log('Logout cleanup completed');
  }, []);

  return {
    isSignedIn,
    isLoaded,
    user,
    performLogoutCleanup
  };
}
