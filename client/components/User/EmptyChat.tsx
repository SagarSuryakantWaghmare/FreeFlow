import React from 'react';

const EmptyChat: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
      <div className="text-5xl mb-4 animate-wave">👋</div>
      <h2 className="text-2xl font-semibold mb-2">Select a user to start chatting</h2>
      <p className="text-muted-foreground max-w-md">
        Your messages are end-to-end encrypted for maximum privacy and security
      </p>
    </div>
  );
};

export default EmptyChat;