import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Users } from 'lucide-react';
import webRTCService from '@/lib/WebRTCService';
import chatStorageService from '@/lib/ChatStorageService';
import connectionManagerService from '@/lib/ConnectionManagerService';
import { toast } from 'sonner';

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
  // Load initial unread counts and setup listeners
  useEffect(() => {
    const updateCounts = () => {
      const counts: Record<string, number> = {};
      users.forEach(user => {
        counts[user.id] = chatStorageService.getUnreadCount(user.id);
      });
      setUnreadCounts(counts);
    };

    updateCounts();

    // Listen for unread count changes
    const handleUnreadCountChange = (peerId: string, count: number) => {
      setUnreadCounts(prev => ({ ...prev, [peerId]: count }));
    };

    // Listen for connection status changes to trigger re-render
    const handleConnectionStatusChange = () => {
      // Force component to re-render by updating a dummy state
      setUnreadCounts(prev => ({ ...prev }));
    };

    chatStorageService.onUnreadCountChange(handleUnreadCountChange);
    connectionManagerService.onConnectionStatusChange(handleConnectionStatusChange);

    return () => {
      chatStorageService.removeUnreadCountChangeCallback(handleUnreadCountChange);
      connectionManagerService.removeConnectionStatusChangeCallback(handleConnectionStatusChange);
    };
  }, [users]);
  const handleUserClick = (user: User) => {
    // Check if user is blacklisted
    if (connectionManagerService.isBlacklisted(user.id)) {
      console.log(`User ${user.id} is blacklisted`);
      return;
    }

    // Check if already connected
    if (webRTCService.isConnectedToPeer(user.id)) {
      // If connected, open chat and mark messages as read
      chatStorageService.markMessagesAsRead(user.id);
      onSelectUser(user.id);
      return;
    }    // Check if there's an existing connection record (for auto-reconnection)
    const existingConnection = connectionManagerService.getConnection(user.id);
    if (existingConnection && existingConnection.status === 'connected') {
      // Try to re-establish the connection automatically
      console.log(`Attempting to reconnect to previously connected user: ${user.id}`);
      webRTCService.requestConnection(user.id);
      
      // Show feedback to user
      toast.info(`Reconnecting to ${user.name}...`);
      return;
    }

    // If not connected and no previous connection, request new connection
    webRTCService.requestConnection(user.id);
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
      <div className="p-6 text-center">
        <div className="p-4 rounded-full bg-gray-100 dark:bg-zinc-800 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-8 w-8 text-gray-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium">No users online</p>
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Check back later</p>
      </div>
    );
  }
  return (
    <div className="px-3 sm:px-4 space-y-2">
      {users.map(user => {
        const isConnected = webRTCService.isConnectedToPeer(user.id);
        const unreadCount = unreadCounts[user.id] || 0;
        const isBlacklisted = connectionManagerService.isBlacklisted(user.id);

        return (
          <button
            key={user.id}
            className={cn(
              "w-full text-left p-3 sm:p-4 rounded-xl mb-2 flex items-center gap-3 transition-all duration-200 relative backdrop-blur-sm border hover:scale-[1.02] active:scale-[0.98]",
              selectedUserId === user.id
                ? "bg-[hsl(263.4,70%,50.4%)] text-white shadow-lg border-[hsl(263.4,70%,50.4%)]"
                : isBlacklisted
                ? "text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-60 border-red-200 dark:border-red-800"
                : "text-slate-900 dark:text-white hover:bg-white/50 dark:hover:bg-zinc-800/50 border-gray-200/50 dark:border-zinc-700/50 hover:shadow-md"
            )}
            onClick={() => handleUserClick(user)}
            disabled={isBlacklisted}
            title={isBlacklisted ? "This user is blocked" : getStatusText(user.id)}
          >
            {/* Status indicator */}
            <div className="relative">
              <div
                className={cn(
                  "h-3 w-3 rounded-full flex-shrink-0 border-2 border-white dark:border-zinc-900",
                  isBlacklisted ? "bg-red-500" : getStatusColor(user.id)
                )}
              />
              {isConnected && !isBlacklisted && (
                <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full animate-ping"></div>
              )}
            </div>
            
            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium truncate text-sm sm:text-base">{user.name}</span>
                
                {/* Status badges */}
                <div className="flex items-center gap-2 ml-2">
                  {isConnected && !isBlacklisted && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                      Connected
                    </span>
                  )}
                  
                  {isBlacklisted && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                      Blocked
                    </span>
                  )}
                  
                  {/* Unread count */}
                  {unreadCount > 0 && !isBlacklisted && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Connection status text */}
              <p className="text-xs text-opacity-70 mt-1 truncate">
                {isBlacklisted ? "User is blocked" : getStatusText(user.id)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default UserList;