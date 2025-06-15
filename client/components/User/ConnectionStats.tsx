'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageCircle, Shield, Wifi } from 'lucide-react';
import chatStorageService from '@/lib/ChatStorageService';
import connectionManagerService from '@/lib/ConnectionManagerService';
import webRTCService from '@/lib/WebRTCService';

interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  totalUnreadMessages: number;
  blacklistedUsers: number;
}

const ConnectionStats: React.FC = () => {
  const [stats, setStats] = useState<ConnectionStats>({
    totalConnections: 0,
    activeConnections: 0,
    totalUnreadMessages: 0,
    blacklistedUsers: 0
  });

  const updateStats = () => {
    const allConnections = connectionManagerService.getAllConnections();
    const activeConnections = webRTCService.getConnectedPeers();
    const totalUnread = chatStorageService.getTotalUnreadCount();
    const blacklisted = connectionManagerService.getBlacklistedUsers();

    setStats({
      totalConnections: allConnections.length,
      activeConnections: activeConnections.length,
      totalUnreadMessages: totalUnread,
      blacklistedUsers: blacklisted.length
    });
  };

  useEffect(() => {
    updateStats();

    // Listen for changes
    const handleUnreadChange = () => updateStats();
    const handleConnectionChange = () => updateStats();

    chatStorageService.onUnreadCountChange(handleUnreadChange);
    connectionManagerService.onConnectionStatusChange(handleConnectionChange);

    // Update every 5 seconds
    const interval = setInterval(updateStats, 5000);

    return () => {
      clearInterval(interval);
      chatStorageService.removeUnreadCountChangeCallback(handleUnreadChange);
      connectionManagerService.removeConnectionStatusChangeCallback(handleConnectionChange);
    };
  }, []);

  return (
    <div className="p-3 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
          <Wifi className="h-3 w-3" />
          <span>{stats.activeConnections} active</span>
        </div>
        <div className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
          <Users className="h-3 w-3" />
          <span>{stats.totalConnections} total</span>
        </div>
        {stats.totalUnreadMessages > 0 && (
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <MessageCircle className="h-3 w-3" />
            <span>{stats.totalUnreadMessages} unread</span>
          </div>
        )}
        {stats.blacklistedUsers > 0 && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Shield className="h-3 w-3" />
            <span>{stats.blacklistedUsers} blocked</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStats;
