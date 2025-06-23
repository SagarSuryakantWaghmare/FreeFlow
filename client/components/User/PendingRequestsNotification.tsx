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
    <div className="fixed top-4 right-4 z-30 animate-in slide-in-from-top-2 duration-300">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-xl relative rounded-xl px-4 py-3 transition-all duration-200 hover:scale-105 backdrop-blur-sm border border-orange-400/20"
        size="sm"
      >
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-medium">
            {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
          </span>
        </div>
        {pendingCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
            {pendingCount}
          </div>
        )}
      </Button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 rounded-2xl shadow-2xl p-4 min-w-[250px] animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Bell className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Pending Requests</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800"
              onClick={() => setShowDetails(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200/50 dark:border-orange-800/50">
            <p className="text-xs text-orange-800 dark:text-orange-200 leading-relaxed">
              You have <span className="font-semibold">{pendingCount}</span> connection request{pendingCount > 1 ? 's' : ''} waiting for your response.
              They will appear as popups when received.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsNotification;
