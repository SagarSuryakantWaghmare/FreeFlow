'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Users, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import UserList from '@/components/User/UserList';
import ChatMessage from '@/components/User/ChatMessage';
import EmptyChat from '@/components/User/EmptyChat';
import HelpInfo from '@/components/User/HelpInfo';
import webSocketService from '@/lib/WebSocketService';
import webRTCService from '@/lib/WebRTCService';

const Chat = () => {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{
    id: string;
    sender: string;
    content: string;
    timestamp: Date;
    isSelf: boolean;
  }[]>([]);
  const [users, setUsers] = useState<{
    id: string;
    name: string;
    online: boolean;
  }[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const username = useRef<string>('');
  const userId = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    // Check if user is logged in
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (!storedUsername || !storedUserId) {
      router.push('/simple-sign-in');
      return;
    }

    username.current = storedUsername;
    userId.current = storedUserId;

    // Initialize WebRTC service with the user's ID
    webRTCService.initialize(userId.current);

    // Connect to WebSocket server
    webSocketService.connect(userId.current)
      .then(() => {
        setIsConnected(true);
        toast.success('Connected to the server');

        // Add WebSocket event listeners
        webSocketService.addEventListener('online_users', handleOnlineUsers);
      })
      .catch((error) => {
        console.error('Failed to connect to WebSocket server:', error);
        toast.error('Failed to connect to the server');
      });

    // Set up WebRTC message handler
    webRTCService.onMessage(handleRTCMessage);

    // Set up WebRTC connection state handler
    webRTCService.onConnectionStateChange(handleConnectionStateChange);

    // Clean up on unmount
    return () => {
      webSocketService.removeEventListener('online_users', handleOnlineUsers);
      webSocketService.disconnect();
      webRTCService.closeAllConnections();
    };
  }, [router]);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle online users update
  const handleOnlineUsers = (data: any) => {
    if (data.users && Array.isArray(data.users)) {
      const onlineUsers = data.users
        .filter((id: string) => id !== userId.current) // Filter out current user
        .map((id: string) => ({
          id,
          name: id, // Using id as name since we don't have actual names from the server
          online: true
        }));

      setUsers(onlineUsers);
    }
  };

  // Handle received WebRTC messages
  const handleRTCMessage = (message: any) => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp,
        isSelf: false
      }
    ]);
  };

  // Handle WebRTC connection state changes
  const handleConnectionStateChange = (remoteUserId: string, state: 'connected' | 'disconnected') => {
    if (state === 'connected') {
      toast.success(`Connected to ${remoteUserId}`);

      // Set selected user if not already set
      if (!selectedUser) {
        setSelectedUser(remoteUserId);
      }
    } else {
      toast.info(`Disconnected from ${remoteUserId}`);

      // Clear selected user if it was the disconnected peer
      if (selectedUser === remoteUserId) {
        setSelectedUser(null);
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !selectedUser) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: username.current,
      content: message,
      timestamp: new Date(),
      isSelf: true,
    };

    // Add message to local state
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessage('');

    // Send message via WebRTC
    if (selectedUser && webRTCService.isConnectedToPeer(selectedUser)) {
      webRTCService.sendMessage(selectedUser, {
        id: newMessage.id,
        sender: username.current,
        content: newMessage.content,
        timestamp: newMessage.timestamp
      });
    } else if (selectedUser) {
      // If not connected, try to establish connection
      webRTCService.requestConnection(selectedUser);
      toast.error('Not connected to peer. Trying to establish connection...');
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);

    // Clear messages when selecting a new user
    setMessages([]);

    // If not already connected to this peer, request a connection
    if (!webRTCService.isConnectedToPeer(userId)) {
      webRTCService.requestConnection(userId);
      toast.info('Requesting connection...');
    }
  };

  const handleLogout = () => {
    webSocketService.disconnect();
    webRTCService.closeAllConnections();

    localStorage.removeItem('username');
    localStorage.removeItem('userId');    toast.success('Logged out successfully');
    router.push('/');
  };
  
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Online Users */}
        <aside className="w-64 bg-sidebar flex flex-col border-r">
          <div className="p-4 bg-sidebar">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <h2 className="font-medium">Online Users</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowHelp(!showHelp)}
                title="Help & Information"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="my-2" />
          </div>

          {showHelp ? (
            <HelpInfo className="mx-2 mb-4" />
          ) : (
            <ScrollArea className="flex-1">
              <UserList
                users={users}
                selectedUserId={selectedUser}
                onSelectUser={handleSelectUser}
              />
            </ScrollArea>
          )}
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-b flex items-center gap-2">
                <User className="h-5 w-5 text-whisper-blue" />
                <span className="font-medium">
                  {users.find(u => u.id === selectedUser)?.name || selectedUser}
                </span>
                <span className="text-xs ml-2">
                  {selectedUser && webRTCService.isConnectedToPeer(selectedUser)
                    ? '(Connected)'
                    : '(Connecting...)'}
                </span>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col gap-3">
                  {messages.length > 0 ? (
                    messages.map(msg => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                      />
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Start a conversation with {users.find(u => u.id === selectedUser)?.name || selectedUser}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t p-3 flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={!selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || !selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
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
