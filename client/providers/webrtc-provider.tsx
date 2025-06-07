"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of a group
type Group = {
  id: string;
  name: string;
  members: number;
  isActive: boolean;
  lastActivity?: Date;
  description?: string;
};

// Define the shape of our WebRTC context
type WebRTCContextType = {
  isWebRTCSupported: boolean;
  groups: Group[];
  activeGroup: Group | null;
  createGroup: (name: string, description?: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  setActiveGroup: (group: Group | null) => void;
  openGroupChat: (group: Group) => void;
};

// Create the context with a default value
const WebRTCContext = createContext<WebRTCContextType>({
  isWebRTCSupported: false,
  groups: [],
  activeGroup: null,
  createGroup: () => {},
  joinGroup: () => {},
  leaveGroup: () => {},
  setActiveGroup: () => {},
  openGroupChat: () => {},
});

// Hook for components to use the WebRTC context
export const useWebRTC = () => useContext(WebRTCContext);

// Provider component that will wrap parts of our app that need WebRTC
export const WebRTCProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isWebRTCSupported, setIsWebRTCSupported] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  useEffect(() => {
    // Check for WebRTC support on the client
    const checkWebRTCSupport = () => {
      if (typeof window !== 'undefined') {
        const isSupported = !!(
          navigator.mediaDevices &&
          typeof navigator.mediaDevices.getUserMedia === 'function' &&
          window.RTCPeerConnection
        );
        setIsWebRTCSupported(isSupported);

        if (!isSupported) {
          console.warn('WebRTC is not supported in this browser. Some features may not work.');
        }
      }
    };

    checkWebRTCSupport();
  }, []);

  // Initialize with some demo groups
  useEffect(() => {
    const demoGroups: Group[] = [
      {
        id: 'group-1',
        name: 'General Chat',
        members: 5,
        isActive: true,
        lastActivity: new Date(),
        description: 'General discussion for everyone'
      },
      {
        id: 'group-2',
        name: 'Tech Talk',
        members: 3,
        isActive: false,
        lastActivity: new Date(Date.now() - 3600000), // 1 hour ago
        description: 'Technical discussions and coding'
      },
      {
        id: 'group-3',
        name: 'Random',
        members: 8,
        isActive: true,
        lastActivity: new Date(Date.now() - 1800000), // 30 minutes ago
        description: 'Random conversations and fun'
      }
    ];
    setGroups(demoGroups);
  }, []);

  // Function to create a new group
  const createGroup = (name: string, description?: string) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name,
      members: 1,
      isActive: true,
      lastActivity: new Date(),
      description
    };
    setGroups(prev => [...prev, newGroup]);
  };

  // Function to join a group
  const joinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members + 1, isActive: true, lastActivity: new Date() }
        : group
    ));
  };

  // Function to leave a group
  const leaveGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: Math.max(0, group.members - 1) }
        : group
    ));
    
    // If leaving the active group, set active group to null
    if (activeGroup?.id === groupId) {
      setActiveGroup(null);
    }
  };

  // Function to open group chat
  const openGroupChat = (group: Group) => {
    setActiveGroup(group);
    // Navigate to group chat page
    if (typeof window !== 'undefined') {
      window.location.href = `/group-chat?groupId=${group.id}`;
    }
  };

  // Value to be provided to consuming components
  const contextValue: WebRTCContextType = {
    isWebRTCSupported,
    groups,
    activeGroup,
    createGroup,
    joinGroup,
    leaveGroup,
    setActiveGroup,
    openGroupChat,
  };

  return (
    <WebRTCContext.Provider value={contextValue}>
      {children}
    </WebRTCContext.Provider>
  );
};