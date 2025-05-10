"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, Users } from 'lucide-react';
import { toast } from 'sonner';
import UserList from '@/components/User/UserList';
import ChatMessage from '@/components/User/ChatMessage';
import EmptyChat from '@/components/User/EmptyChat';

const mockUsers = [
  { id: '1', name: 'Alex', online: true },
  { id: '2', name: 'Taylor', online: true },
  { id: '3', name: 'Jordan', online: false },
  { id: '4', name: 'Casey', online: true },
];

const mockMessages = [
  { id: '1', sender: 'Alex', content: 'Hey there!', timestamp: new Date(Date.now() - 35000000), isSelf: false },
  { id: '2', sender: 'You', content: 'Hi Alex! How are you?', timestamp: new Date(Date.now() - 34000000), isSelf: true },
  { id: '3', sender: 'Alex', content: 'I\'m doing well, thanks for asking. How about you?', timestamp: new Date(Date.now() - 33000000), isSelf: false },
  { id: '4', sender: 'You', content: 'Pretty good! Just trying out this new chat app.', timestamp: new Date(Date.now() - 31000000), isSelf: true },
];

const Chat = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [users, setUsers] = useState(mockUsers);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [username, setUsername] = useState('User');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        router.push('/');
      }
    }
  }, [router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedUser) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: 'You',
      content: message,
      timestamp: new Date(),
      isSelf: true,
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        sender: users.find(u => u.id === selectedUser)?.name || 'User',
        content: 'Thanks for your message!',
        timestamp: new Date(),
        isSelf: false,
      };
      
      setMessages(prevMessages => [...prevMessages, reply]);
    }, 1000);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    // Load conversation in a real app
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('username');
      toast.success('Logged out successfully');
      router.push('/');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-whisper-blue p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-white" />
          <h1 className="text-xl font-semibold text-white">Free Flow</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white">{username}</span>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-white border-white hover:bg-white hover:text-whisper-blue"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Online Users */}
        <aside className="w-64 bg-sidebar flex flex-col border-r">
          <div className="p-4 bg-sidebar">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" />
              <h2 className="font-medium">Online Users</h2>
            </div>
            <Separator className="my-2" />
          </div>
          
          <ScrollArea className="flex-1">
            <UserList 
              users={users} 
              selectedUserId={selectedUser} 
              onSelectUser={handleSelectUser} 
            />
          </ScrollArea>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b flex items-center gap-2">
                <User className="h-5 w-5 text-whisper-blue" />
                <span className="font-medium">
                  {users.find(u => u.id === selectedUser)?.name || 'User'}
                </span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                  {messages.map(msg => (
                    <ChatMessage 
                      key={msg.id} 
                      message={msg} 
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!message.trim()}
                  className="bg-whisper-purple hover:bg-whisper-purple/90"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <EmptyChat />
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
