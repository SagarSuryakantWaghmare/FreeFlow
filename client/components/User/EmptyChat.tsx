import React from 'react';
import { Shield, Lock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex flex-1 h-full min-h-0 m-0 p-4 sm:p-8 items-center justify-center flex-col text-center overflow-y-auto bg-white/30 dark:bg-zinc-950/30 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Animation */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 bg-[hsl(263.4,70%,50.4%)] bg-opacity-5 rounded-full blur-2xl w-32 h-32 mx-auto animate-pulse"></div>
          <div className="relative text-6xl sm:text-7xl mb-4 animate-bounce">👋</div>
        </div>
        
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 text-slate-900 dark:text-white">
              Select a user to start chatting
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Your messages are peer-to-peer encrypted for maximum privacy and security
            </p>
          </div>
          
          {/* Feature Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-[hsl(263.4,70%,50.4%)]">
                ✨ NEW: Chat history syncs & persists until logout
              </span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="p-3 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 mb-3">
              <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-slate-900 dark:text-white">Secure</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 text-center leading-relaxed">
              End-to-end encryption keeps your conversations private
            </p>
          </div>

          <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="p-3 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 mb-3">
              <Lock className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-slate-900 dark:text-white">Persistent</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 text-center leading-relaxed">
              Messages sync between users and persist until logout
            </p>
          </div>

          <div className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="p-3 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 mb-3">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(263.4,70%,50.4%)]" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base text-slate-900 dark:text-white">Real-time</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 text-center leading-relaxed">
              Instant messaging with online users around the world
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;