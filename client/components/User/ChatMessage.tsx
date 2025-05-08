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
        message.isSelf 
          ? "chat-bubble-sent"
          : "chat-bubble-received"
      )}>
        <p>{message.content}</p>
      </div>
      <span className="text-xs text-muted-foreground mt-1 mx-1">
        {format(message.timestamp, 'p')}
      </span>
    </div>
  );
};

export default ChatMessage;