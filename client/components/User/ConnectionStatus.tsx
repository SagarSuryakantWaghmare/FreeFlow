'use client';
import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import webSocketService from '@/lib/WebSocketService.js';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className }) => {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    // Initial check
    checkConnection();
    
    // Set up periodic checks
    const interval = setInterval(() => {
      checkConnection();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = () => {
    if (webSocketService.isConnected()) {
      setStatus('connected');
    } else {
      setStatus('disconnected');
    }
    
    setLastChecked(new Date());
  };

  return (
    <div className={className}>
      <Badge 
        variant={status === 'connected' ? 'success' : status === 'connecting' ? 'warning' : 'destructive'}
        className="flex items-center gap-1.5 font-normal"
      >
        <span className={`connection-status ${status}`}></span>
        {status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
