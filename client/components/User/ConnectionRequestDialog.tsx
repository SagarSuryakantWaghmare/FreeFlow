'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { User, Check, X } from 'lucide-react';

interface ConnectionRequest {
  fromUserId: string;
  fromUserName: string;
  timestamp: Date;
}

interface ConnectionRequestDialogProps {
  request: ConnectionRequest | null;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

const ConnectionRequestDialog: React.FC<ConnectionRequestDialogProps> = ({
  request,
  onAccept,
  onReject,
  onClose
}) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Connection Request
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              New request received
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-slate-700 dark:text-zinc-300">
            <span className="font-medium">{request.fromUserName}</span> wants to connect with you for peer-to-peer chat.
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
            Received {request.timestamp.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            variant="destructive"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Reject & Block
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-2 text-slate-600 dark:text-zinc-400"
        >
          Ignore for now
        </Button>
      </div>
    </div>
  );
};

export default ConnectionRequestDialog;
