import React from 'react';
import { Shield, Lock, Users } from 'lucide-react';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-5xl mb-4 animate-wave">👋</div>
      <h2 className="text-2xl font-semibold mb-2">Select a user to start chatting</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your messages are peer-to-peer encrypted for maximum privacy and security
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 max-w-3xl">
        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Shield className="h-8 w-8 text-whisper-purple mb-2" />
          <h3 className="font-medium mb-1">Secure</h3>
          <p className="text-sm text-muted-foreground">
            End-to-end encryption keeps your conversations private
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Lock className="h-8 w-8 text-whisper-purple mb-2" />
          <h3 className="font-medium mb-1">Serverless</h3>
          <p className="text-sm text-muted-foreground">
            Direct peer-to-peer connections with no message storage
          </p>
        </div>
        
        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <Users className="h-8 w-8 text-whisper-purple mb-2" />
          <h3 className="font-medium mb-1">Real-time</h3>
          <p className="text-sm text-muted-foreground">
            Instant messaging with online users around the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;