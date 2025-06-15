'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import connectionManagerService from '@/lib/ConnectionManagerService';

const PendingRequestsNotification: React.FC = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  useEffect(() => {
    const updateCount = () => {
      const requests = connectionManagerService.getPendingRequests();
      setPendingCount(requests.length);
    };

    updateCount();

    // Listen for connection request changes and status changes
    const handleRequest = () => updateCount();
    const handleStatusChange = () => updateCount();
    
    connectionManagerService.onConnectionRequest(handleRequest);
    connectionManagerService.onConnectionStatusChange(handleStatusChange);

    // Update every 2 seconds to catch any missed updates
    const interval = setInterval(updateCount, 2000);

    return () => {
      clearInterval(interval);
      connectionManagerService.removeConnectionRequestCallback(handleRequest);
      connectionManagerService.removeConnectionStatusChangeCallback(handleStatusChange);
    };
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg relative"
        size="sm"
      >
        <Bell className="h-4 w-4 mr-1" />
        {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </Button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pending Requests</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowDetails(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-gray-600 dark:text-zinc-400">
            You have {pendingCount} connection request{pendingCount > 1 ? 's' : ''} waiting for your response.
            They will appear as popups when received.
          </p>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsNotification;
