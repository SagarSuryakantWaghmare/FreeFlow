import React from 'react';
import { cn } from '@/lib/utils';
import webRTCService from '@/lib/WebRTCService';

interface User {
  id: string;
  name: string;
  online: boolean;
}

interface UserListProps {
  users: User[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 dark:text-zinc-400">
        No users online
      </div>
    );
  } else {
    console.log("UserList", users);  }

  return (
    <div className="px-2">
      {users.map(user => {
        const isConnected = webRTCService.isConnectedToPeer(user.id);
        
        return (
          <button
            key={user.id}
            className={cn(
              "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center gap-2 transition-colors",
              selectedUserId === user.id 
                ? "bg-blue-600 dark:bg-purple-800 text-white" 
                : "text-slate-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
            )}
            onClick={() => onSelectUser(user.id)}
          >
            <span 
              className={cn(
                "h-2 w-2 rounded-full", 
                isConnected ? "bg-green-500" : user.online ? "bg-amber-500 dark:bg-yellow-500" : "bg-gray-400"
              )} 
            />
            <span>{user.name}</span>
            {isConnected && (
              <span className="ml-auto text-xs text-green-500 dark:text-green-400">Connected</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default UserList;