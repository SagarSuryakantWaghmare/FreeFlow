import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import webRTCService from '@/lib/WebRTCService';
import chatStorageService from '@/lib/ChatStorageService';
import connectionManagerService from '@/lib/ConnectionManagerService';

interface User {
  id: string;
  name: string;
  online: boolean;
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Load initial unread counts
  useEffect(() => {
    const counts: Record<string, number> = {};
    users.forEach(user => {
      counts[user.id] = chatStorageService.getUnreadCount(user.id);
    });
    setUnreadCounts(counts);

    // Listen for unread count changes
    const handleUnreadCountChange = (peerId: string, count: number) => {
      setUnreadCounts(prev => ({ ...prev, [peerId]: count }));
    };

    chatStorageService.onUnreadCountChange(handleUnreadCountChange);

    return () => {
      chatStorageService.removeUnreadCountChangeCallback(handleUnreadCountChange);
    };
  }, [users]);

  const handleUserClick = (user: User) => {
    // Check if user is blacklisted
    if (connectionManagerService.isBlacklisted(user.id)) {
      console.log(`User ${user.id} is blacklisted`);
      return;
    }

    // If not connected, request connection first
    if (!webRTCService.isConnectedToPeer(user.id)) {
      webRTCService.requestConnection(user.id);
      return; // Don't open chat yet
    }

    // If connected, open chat and mark messages as read
    chatStorageService.markMessagesAsRead(user.id);
    onSelectUser(user.id);
  };

  const getConnectionStatus = (userId: string) => {
    const connection = connectionManagerService.getConnection(userId);
    if (connection) {
      return connection.status;
    }
    return webRTCService.isConnectedToPeer(userId) ? 'connected' : 'disconnected';
  };

  const getStatusColor = (userId: string) => {
    const status = getConnectionStatus(userId);
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (userId: string) => {
    const status = getConnectionStatus(userId);
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Click to connect';
    }
  };

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-zinc-400">
        No users online
      </div>
    );
  }

  return (
    <div className="px-2">
      {users.map(user => {
        const isConnected = webRTCService.isConnectedToPeer(user.id);
        const unreadCount = unreadCounts[user.id] || 0;
        const isBlacklisted = connectionManagerService.isBlacklisted(user.id);

        return (
          <button
            key={user.id}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center gap-2 transition-colors relative",
              selectedUserId === user.id
                ? "bg-purple-800 dark:bg-purple-800 text-white"
                : isBlacklisted
                ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-60"
                : "text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
            )}
            onClick={() => handleUserClick(user)}
            disabled={isBlacklisted}
            title={isBlacklisted ? "This user is blocked" : getStatusText(user.id)}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full flex-shrink-0",
                isBlacklisted ? "bg-red-500" : getStatusColor(user.id)
              )}
            />
            <span className="flex-1 truncate">{user.name}</span>
            
            {/* Connection status text */}
            {isConnected && !isBlacklisted && (
              <span className="text-xs text-green-500 dark:text-green-400 flex-shrink-0">
                Connected
              </span>
            )}
            
            {/* Unread message count */}
            {unreadCount > 0 && !isBlacklisted && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 ml-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
            
            {/* Blacklisted indicator */}
            {isBlacklisted && (
              <span className="text-xs text-red-500 dark:text-red-400 flex-shrink-0">
                Blocked
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UserList;