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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-300">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-gray-200/50 dark:border-zinc-700/50 animate-in zoom-in-95 duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 rounded-2xl border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
            <User className="h-6 w-6 text-[hsl(263.4,70%,50.4%)]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Connection Request
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              New request received
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50">
            <p className="text-slate-700 dark:text-zinc-300 mb-3">
              <span className="font-semibold text-[hsl(263.4,70%,50.4%)]">{request.fromUserName}</span> wants to connect with you for peer-to-peer chat.
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Received {request.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            variant="destructive"
            className="flex-1 rounded-xl py-3 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Reject & Block
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200"
        >
          Ignore for now
        </Button>
      </div>
    </div>
  );
};

export default ConnectionRequestDialog;
