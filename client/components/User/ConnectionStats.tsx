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
    <div className="p-4 sm:p-6 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-zinc-700/50 shadow-lg">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-gray-200/30 dark:border-zinc-700/30">
          <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30">
            <Wifi className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{stats.activeConnections}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">active</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-gray-200/30 dark:border-zinc-700/30">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{stats.totalConnections}</p>
            <p className="text-xs text-slate-500 dark:text-zinc-400">total</p>
          </div>
        </div>
        
        {stats.totalUnreadMessages > 0 && (
          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50">
            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-300">{stats.totalUnreadMessages}</p>
              <p className="text-xs text-orange-600 dark:text-orange-500">unread</p>
            </div>
          </div>
        )}
        
        {stats.blacklistedUsers > 0 && (
          <div className="flex items-center gap-2 p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-800 dark:text-red-300">{stats.blacklistedUsers}</p>
              <p className="text-xs text-red-600 dark:text-red-500">blocked</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStats;
