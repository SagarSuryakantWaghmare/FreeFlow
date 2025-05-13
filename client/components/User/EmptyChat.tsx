import React from 'react';
import { Shield, Lock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EmptyChat: React.FC = () => {
  return (    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 text-center overflow-y-auto">
      <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-wave">👋</div>
      <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-foreground">Select a user to start chatting</h2>
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-3 sm:mb-4 px-2">
        Your messages are peer-to-peer encrypted for maximum privacy and security
      </p>
      <Badge variant="secondary" className="mb-4 sm:mb-6 text-xs sm:text-sm">
        ✨ NEW: Chat history now syncs between users & persists until logout
      </Badge>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mt-2 sm:mt-4 max-w-3xl px-2">        <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card border border-border">
          <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
          <h3 className="font-medium mb-1 text-sm sm:text-base text-foreground">Secure</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            End-to-end encryption keeps your conversations private
          </p>
        </div>
        
        <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card border border-border">          
          <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
          <h3 className="font-medium mb-1 text-sm sm:text-base text-foreground">Persistent</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Messages sync between users and persist until logout
          </p>
        </div>
        
        <div className="flex flex-col items-center p-3 sm:p-4 rounded-lg bg-card border border-border">
          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-1 sm:mb-2" />
          <h3 className="font-medium mb-1 text-sm sm:text-base text-foreground">Real-time</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Instant messaging with online users around the world
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;