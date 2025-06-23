import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isSelf: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={cn("flex flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-300", 
      message.isSelf ? "items-end" : "items-start")}>
      <div className={cn(
        "max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md", 
        message.isSelf 
          ? "bg-[hsl(263.4,70%,50.4%)] text-white rounded-br-md" 
          : "bg-white/90 dark:bg-zinc-800/90 text-slate-900 dark:text-zinc-100 border border-gray-200/50 dark:border-zinc-700/50 rounded-bl-md"
      )}>
        {!message.isSelf && (
          <div className="text-xs font-semibold mb-2 text-[hsl(263.4,70%,50.4%)] dark:text-purple-400 tracking-wide">
            {message.sender}
          </div>
        )}
        <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
      </div>
      <span className="text-xs text-slate-500 dark:text-zinc-500 mt-1.5 mx-2 opacity-70">
        {format(new Date(message.timestamp), 'p')}
      </span>
    </div>
  );
};

export default ChatMessage;