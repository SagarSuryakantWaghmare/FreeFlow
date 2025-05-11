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
    <div className={cn(
      "flex flex-col",
      message.isSelf ? "items-end" : "items-start"
    )}>
      <div className={cn(
        "max-w-[75%] rounded-lg px-4 py-2",
        message.isSelf
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      )}>
        {!message.isSelf && (
          <div className="text-xs font-medium mb-1 text-primary">
            {message.sender}
          </div>
        )}
        <p>{message.content}</p>
      </div>
      <span className="text-xs text-muted-foreground mt-1 mx-1">
        {format(new Date(message.timestamp), 'p')}
      </span>
    </div>
  );
};

export default ChatMessage;