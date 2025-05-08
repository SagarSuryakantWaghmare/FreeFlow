import React from 'react';
import { cn } from '@/lib/utils';

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

const UserList: React.FC<UserListProps> = ({ users, selectedUserId, onSelectUser }) => {
  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No users online
      </div>
    );
  }

  return (
    <div className="px-2">
      {users.map(user => (
        <button
          key={user.id}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md mb-1 flex items-center gap-2 transition-colors",
            selectedUserId === user.id 
              ? "bg-sidebar-primary text-sidebar-primary-foreground" 
              : "hover:bg-sidebar-accent"
          )}
          onClick={() => onSelectUser(user.id)}
        >
          <span 
            className={cn(
              "h-2 w-2 rounded-full", 
              user.online ? "bg-green-500" : "bg-gray-400"
            )} 
          />
          <span>{user.name}</span>
        </button>
      ))}
    </div>
  );
};

export default UserList;