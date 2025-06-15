"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import webSocketService from '@/lib/WebSocketService';
import groupChatService from '@/lib/GroupChatService';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';

/**
 * Custom hook to detect Clerk logout and perform cleanup
 */
export const useClerkLogoutDetection = () => {
  const { isSignedIn } = useUser();
  const [wasSignedIn, setWasSignedIn] = useState<boolean | null>(null);

  const performLogoutCleanup = () => {
    // Disconnect services
    if (webSocketService) {
      webSocketService.disconnect();
    }

    // Clear all group chat data (subscriptions, in-memory state)
    groupChatService.clearAllData();    // Clear all localStorage data completely
    const keysToRemove: string[] = [];

    for (let i = 0; i < SafeLocalStorage.getLength(); i++) {
      const key = SafeLocalStorage.key(i);
      if (key && (
        // Single chat related keys
        key.startsWith('chat_messages_') ||
        key.startsWith('unread_count_') ||
        key.startsWith('freeflow_blacklist_') ||
        key.startsWith('freeflow_connections_') ||
        // Group chat related keys
        key.startsWith('group_messages_') ||
        key.startsWith('group_unread_') ||
        key.startsWith('group_info_') ||
        key.startsWith('user_groups_') ||
        key === 'group_join_requests' ||
        key === 'pending_group_approvals' ||
        key === 'group_connections' ||
        key === 'group_notifications' ||
        // User related keys
        key === 'username' ||
        key === 'userId' ||
        key === 'user_real_name'
      )) {
        keysToRemove.push(key);
      }
    }

    // Remove all identified keys
    keysToRemove.forEach(key => SafeLocalStorage.removeItem(key));
  };
  useEffect(() => {
    // Initialize wasSignedIn on first render
    if (wasSignedIn === null) {
      setWasSignedIn(!!isSignedIn);
      return;
    }

    // If user was signed in but now is not, they logged out
    if (wasSignedIn && !isSignedIn) {
      console.log('Clerk logout detected - performing cleanup');
      performLogoutCleanup();
    }

    setWasSignedIn(!!isSignedIn);
  }, [isSignedIn, wasSignedIn]);

  return { performLogoutCleanup };
};
