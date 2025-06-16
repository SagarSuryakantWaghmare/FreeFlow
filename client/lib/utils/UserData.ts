"use client";

import { SafeLocalStorage } from './SafeLocalStorage';

/**
 * Utility functions for accessing stored user data
 */

export interface UserData {
  userId: string | null;
  username: string | null;
}

/**
 * Get current user data from localStorage
 */
export function getUserData(): UserData {
  return {
    userId: SafeLocalStorage.getItem('userId'),
    username: SafeLocalStorage.getItem('username')
  };
}

/**
 * Get just the user ID
 */
export function getUserId(): string | null {
  return SafeLocalStorage.getItem('userId');
}

/**
 * Get just the username
 */
export function getUsername(): string | null {
  return SafeLocalStorage.getItem('username');
}

/**
 * Check if user data is available
 */
export function isUserDataAvailable(): boolean {
  const { userId, username } = getUserData();
  return userId !== null && username !== null;
}
