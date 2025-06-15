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
    <div className={cn("flex flex-col", message.isSelf ? "items-end" : "items-start")}>
      <div className={cn("max-w-[75%] rounded-lg px-4 py-2", message.isSelf ? "bg-purple-800 dark:bg-purple-800 text-white" : "bg-gray-200 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100")}>
        {!message.isSelf && (
          <div className="text-xs font-medium mb-1 text-purple-800 dark:text-purple-400">
            {message.sender}
          </div>
        )}
        <p>{message.content}</p>
      </div>
      <span className="text-xs text-slate-500 dark:text-zinc-500 mt-1 mx-1">
        {format(new Date(message.timestamp), 'p')}
      </span>
    </div>
  );
};

export default ChatMessage;