"use client";

/**
 * Safe localStorage utility functions that work in both client and server environments
 */
export class SafeLocalStorage {
  /**
   * Check if we're in a browser environment
   */
  static isClientSide(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  /**
   * Safely get an item from localStorage
   */
  static getItem(key: string): string | null {
    if (!this.isClientSide()) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting localStorage item "${key}":`, error);
      return null;
    }
  }

  /**
   * Safely set an item in localStorage
   */
  static setItem(key: string, value: string): void {
    if (!this.isClientSide()) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting localStorage item "${key}":`, error);
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  static removeItem(key: string): void {
    if (!this.isClientSide()) {
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage item "${key}":`, error);
    }
  }

  /**
   * Safely get localStorage length
   */
  static getLength(): number {
    if (!this.isClientSide()) {
      return 0;
    }
    try {
      return localStorage.length;
    } catch (error) {
      console.error('Error getting localStorage length:', error);
      return 0;
    }
  }

  /**
   * Safely get localStorage key by index
   */
  static key(index: number): string | null {
    if (!this.isClientSide()) {
      return null;
    }
    try {
      return localStorage.key(index);
    } catch (error) {
      console.error(`Error getting localStorage key at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Safely iterate through localStorage
   */
  static getAllKeys(): string[] {
    if (!this.isClientSide()) {
      return [];
    }
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Error getting all localStorage keys:', error);
      return [];
    }
  }

  /**
   * Safely clear all localStorage
   */
  static clear(): void {
    if (!this.isClientSide()) {
      return;
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}
