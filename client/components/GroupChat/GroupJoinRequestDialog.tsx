"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Clock, UserCheck, UserX } from 'lucide-react';
import { JoinRequest } from '@/lib/GroupManagerService';

interface GroupJoinRequestDialogProps {
  requests: JoinRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onClose: () => void;
}

export default function GroupJoinRequestDialog({ 
  requests, 
  onApprove, 
  onReject, 
  onClose 
}: GroupJoinRequestDialogProps) {
  if (!requests || requests.length === 0) return null;

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-purple-200 dark:border-purple-800 shadow-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg text-slate-900 dark:text-white">
                Group Join Requests ({requests.length})
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 overflow-y-auto">
          {requests.map((request) => (
            <div key={request.requestId} className="space-y-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(request.timestamp)}
                </Badge>
              </div>
              
              <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                  <strong className="text-slate-900 dark:text-white">{request.userName}</strong> wants to join
                </p>
                <p className="text-base font-medium text-slate-900 dark:text-white">
                  {request.groupName}
                </p>
              </div>
              
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                User ID: {request.userId}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onApprove(request.requestId)}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                
                <Button
                  onClick={() => onReject(request.requestId)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
          
          <Separator />
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-600 dark:text-zinc-400"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
