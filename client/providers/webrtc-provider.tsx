"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our WebRTC context
type WebRTCContextType = {
  isWebRTCSupported: boolean;
};

// Create the context with a default value
const WebRTCContext = createContext<WebRTCContextType>({
  isWebRTCSupported: false,
});

// Hook for components to use the WebRTC context
export const useWebRTC = () => useContext(WebRTCContext);

// Provider component that will wrap parts of our app that need WebRTC
export const WebRTCProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isWebRTCSupported, setIsWebRTCSupported] = useState(false);

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

  // Value to be provided to consuming components
  const contextValue: WebRTCContextType = {
    isWebRTCSupported,
  };

  return (
    <WebRTCContext.Provider value={contextValue}>
      {children}
    </WebRTCContext.Provider>
  );
};
