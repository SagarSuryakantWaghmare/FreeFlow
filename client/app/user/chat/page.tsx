'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User, Users, HelpCircle, Menu, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import UserList from '@/components/User/UserList';
import ChatMessage from '@/components/User/ChatMessage';
import EmptyChat from '@/components/User/EmptyChat';
import HelpInfo from '@/components/User/HelpInfo';
import ConnectionRequestDialog from '@/components/User/ConnectionRequestDialog';
import ConnectionStats from '@/components/User/ConnectionStats';
import PendingRequestsNotification from '@/components/User/PendingRequestsNotification';
import webSocketService from '@/lib/WebSocketService';
import webRTCService from '@/lib/WebRTCService';
import chatStorageService from '@/lib/ChatStorageService';
import connectionManagerService from '@/lib/ConnectionManagerService';
import groupChatService from '@/lib/GroupChatService';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Connection request dialog state
  const [connectionRequest, setConnectionRequest] = useState<{
    fromUserId: string;
    fromUserName: string;
    timestamp: Date;
  } | null>(null);
  
  const username = useRef<string>('');
  const userId = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket when component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (!storedUsername || !storedUserId) {
      router.push('/simple-sign-in');
      return;
    }    username.current = storedUsername;
    userId.current = storedUserId;

    webRTCService.initialize(userId.current);
    connectionManagerService.initialize(userId.current);// Connection status event handler
    const handleConnectionStatus = (data: any) => {
      if (data.status === 'reconnecting') {
        toast.info(`Reconnecting... Attempt ${data.attempt}/${data.maxAttempts}`);
      } else if (data.status === 'mock_mode') {
        setIsConnected(false);
        toast.error('Using mock mode - server connection failed');
      }
    };    // Connection request handler
    const handleConnectionRequest = (request: { fromUserId: string; fromUserName: string; timestamp: Date }) => {
      setConnectionRequest(request);
      toast.info(`Connection request from ${request.fromUserName}`);
    };    // Logout notification handler
    const handleLogoutNotification = (data: any) => {
      if (data.fromUserId && data.fromUserId !== userId.current) {
        console.log(`User ${data.fromUserId} logged out, clearing their chat data`);
        
        // Clear all messages and unread counts for this user
        chatStorageService.clearMessagesForUser(data.fromUserId);
        
        // Close WebRTC connection if exists
        webRTCService.closePeerConnection(data.fromUserId);
        
        // Update connection status in connection manager
        connectionManagerService.updateConnectionStatus(data.fromUserId, 'disconnected');
        
        // If we were chatting with this user, close the chat and go back to user list
        if (selectedUser === data.fromUserId) {
          setSelectedUser(null);
          setMessages([]);
          // Find the user's name from users list for toast
          const loggedOutUser = users.find(user => user.id === data.fromUserId);
          toast.info(`${loggedOutUser?.name || 'User'} has logged out. Chat closed.`);
        }
        
        // Remove from users list
        setUsers(prev => prev.filter(user => user.id !== data.fromUserId));
      }
    };// Setup connection manager listeners
    connectionManagerService.onConnectionRequest(handleConnectionRequest);    // Auto-reconnect to previously connected peers
    const autoReconnectToPeers = () => {
      const existingConnections = connectionManagerService.getAllConnections();
      console.log('Found existing connections for auto-reconnect:', existingConnections);
      
      existingConnections.forEach(connection => {
        // Only auto-reconnect if they were previously connected and not blacklisted
        if (connection.status === 'connected' && !connectionManagerService.isBlacklisted(connection.userId)) {
          console.log(`Auto-reconnecting to ${connection.userId}`);
          // Set timeout to ensure WebSocket is connected first
          setTimeout(() => {
            // Update status to connecting first
            connectionManagerService.updateConnectionStatus(connection.userId, 'connecting');
            webRTCService.requestConnection(connection.userId);
          }, 2000 + Math.random() * 1000); // Add small random delay to avoid conflicts
        }
      });
    };

    // Set up auto-reconnection after WebSocket connects
    setTimeout(autoReconnectToPeers, 3000);// Connect to WebSocket server with timeout
    let connectionTimeout: NodeJS.Timeout;

    // Set a timeout to handle connection attempts that take too long
    connectionTimeout = setTimeout(() => {
      if (!webSocketService.isConnected()) {
        setIsConnected(false);
        toast.error('Connection timeout - the server might be down or unreachable');
      }
    }, 8000);

    // Properly handle the connection promise
    webSocketService.connect(userId.current)
      .then(() => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        toast.success('Connected to the server');        // Add WebSocket event listeners
        webSocketService.addEventListener('online_users', handleOnlineUsers);
        webSocketService.addEventListener('connection_status', handleConnectionStatus);
        webSocketService.addEventListener('logout_notification', handleLogoutNotification);
      })
      .catch((error) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        console.error('Failed to connect to WebSocket server:', error);
        toast.error(`Connection failed: ${error.message || 'Could not connect to the server'}`);
      });    // Set up WebRTC message handler
    webRTCService.onMessage(handleRTCMessage);

    // Set up WebRTC connection state handler
    webRTCService.onConnectionStateChange(handleConnectionStateChange);

    // Set up background message handler
    chatStorageService.onNewMessage(handleBackgroundMessage);    // Clean up on unmount
    return () => {
      webSocketService.removeEventListener('online_users', handleOnlineUsers);
      webSocketService.removeEventListener('connection_status', handleConnectionStatus);
      webSocketService.removeEventListener('logout_notification', handleLogoutNotification);
      connectionManagerService.removeConnectionRequestCallback(handleConnectionRequest);
      chatStorageService.removeNewMessageCallback(handleBackgroundMessage);
      webSocketService.disconnect();
      webRTCService.closeAllConnections();
    };
  }, [router]);
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update page title with unread count
  useEffect(() => {
    const totalUnread = chatStorageService.getTotalUnreadCount();
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) FreeFlow Chat`;
    } else {
      document.title = 'FreeFlow Chat';
    }
  }, []);

  // Listen for unread count changes to update title
  useEffect(() => {
    const handleUnreadCountChange = () => {
      const totalUnread = chatStorageService.getTotalUnreadCount();
      if (totalUnread > 0) {
        document.title = `(${totalUnread}) FreeFlow Chat`;
      } else {
        document.title = 'FreeFlow Chat';
      }
    };

    chatStorageService.onUnreadCountChange(handleUnreadCountChange);

    return () => {
      chatStorageService.removeUnreadCountChangeCallback(handleUnreadCountChange);
    };
  }, []);

  // Handle online users update
  const handleOnlineUsers = (data: any) => {
    if (data.users && Array.isArray(data.users)) {
      const onlineUsers = data.users
        .filter((user: any) => user.id !== userId.current) // Filter out current user
        .map((user: any) => ({
          id: user.id,
          name: user.name || user.id, // Use name if available, fallback to id
          online: true
        }));

      setUsers(onlineUsers);
    }
  };  // Handle received WebRTC messages (simplified - storage is now handled in WebRTCService)
  const handleRTCMessage = (message: any) => {
    // Update UI if this message is relevant to the current chat
    const messageFromUser = message.fromUserId || message.sender; // Get the actual sender
    
    if (selectedUser && messageFromUser === selectedUser) {
      const newMessage = {
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: new Date(message.timestamp),
        isSelf: message.sender === username.current
      };

      setMessages(prevMessages => {
        // Check if we already have this message (to avoid duplicates)
        const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
        if (messageExists) return prevMessages;

        const updatedMessages = [...prevMessages, newMessage];
        updatedMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return updatedMessages;
      });
    }
  };
  // Handle background messages (when chat window is not active)
  const handleBackgroundMessage = (peerId: string, message: any) => {
    // Always add message to UI if it's from the currently selected user
    if (selectedUser === peerId) {
      const newMessage = {
        id: message.id,
        sender: message.sender,
        content: message.content,
        timestamp: new Date(message.timestamp),
        isSelf: message.isSelf
      };

      setMessages(prevMessages => {
        // Check if message already exists to avoid duplicates
        const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
        if (messageExists) return prevMessages;

        const updatedMessages = [...prevMessages, newMessage];
        updatedMessages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return updatedMessages;
      });
    }
    // For other users, the message is already saved by ChatStorageService
    // and unread count is updated automatically
  };  // Handle WebRTC connection state changes
  const handleConnectionStateChange = (remoteUserId: string, state: 'connected' | 'disconnected') => {
    if (state === 'connected') {
      toast.success(`Connected to ${remoteUserId}`);
      
      // If this is the user we're trying to chat with, open the chat automatically
      if (selectedUser === remoteUserId) {
        // Refresh messages to load any new ones
        const chatHistory = chatStorageService.getMessages(remoteUserId);
        setMessages(chatHistory);
      }
    } else {
      toast.info(`Disconnected from ${remoteUserId}`);

      // Clear selected user if it was the disconnected peer
      if (selectedUser === remoteUserId) {
        setSelectedUser(null);
        setMessages([]);
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

    // Save message to localStorage
    chatStorageService.saveMessage(selectedUser, newMessage);

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
  };  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    setSidebarOpen(false); // Close sidebar on mobile after selecting a user

    // Load chat history for this user
    const chatHistory = chatStorageService.getMessages(userId);
    setMessages(chatHistory);

    // Mark messages as read
    chatStorageService.markMessagesAsRead(userId);

    // Only request connection if not already connected
    // (The UserList component now handles connection requests)
  };
  // Add effect to refresh messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      const refreshMessages = () => {
        const chatHistory = chatStorageService.getMessages(selectedUser);
        setMessages(chatHistory);
      };

      // Refresh messages immediately
      refreshMessages();

      // Listen for new messages from the storage service
      const handleNewMessage = (peerId: string, message: any) => {
        if (peerId === selectedUser) {
          refreshMessages(); // Refresh the entire message list to ensure consistency
        }
      };

      chatStorageService.onNewMessage(handleNewMessage);

      return () => {
        chatStorageService.removeNewMessageCallback(handleNewMessage);
      };
    }
  }, [selectedUser]);  const handleLogout = () => {
    // Get connected users before clearing everything
    const connectedUserIds = connectionManagerService.getConnectedUserIds();
    
    // Send logout notification to all connected peers
    if (connectedUserIds.length > 0 && userId.current) {
      webSocketService.sendLogoutNotification(userId.current, connectedUserIds);
    }
    
    // Close all WebRTC connections
    webRTCService.closeAllConnections();
    
    // Disconnect from WebSocket
    webSocketService.disconnect();
    
    // Clear all group chat data (subscriptions, in-memory state)
    groupChatService.clearAllData();
    
    // Clear all user-specific data from localStorage
    connectionManagerService.clearAllUserData();
    
    // Clear all chat messages from localStorage (already handled by clearAllUserData)
    chatStorageService.clearAllMessages();

    toast.success('Logged out successfully');
    router.push('/');
  };

  // Connection request dialog handlers
  const handleAcceptConnection = () => {
    if (connectionRequest) {
      webRTCService.acceptConnectionRequest(connectionRequest.fromUserId);
      toast.success(`Accepted connection from ${connectionRequest.fromUserName}`);
      setConnectionRequest(null);
    }
  };

  const handleRejectConnection = () => {
    if (connectionRequest) {
      webRTCService.rejectConnectionRequest(connectionRequest.fromUserId);
      toast.info(`Rejected and blocked ${connectionRequest.fromUserName}`);
      setConnectionRequest(null);
    }
  };
  const handleIgnoreConnection = () => {
    if (connectionRequest) {
      connectionManagerService.ignoreConnectionRequest(connectionRequest.fromUserId);
      setConnectionRequest(null);
    }
  };

  // Close current chat window
  const handleCloseChat = () => {
    setSelectedUser(null);
    setMessages([]);
    toast.info('Chat closed');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 dark:bg-black text-foreground dark:text-white overflow-hidden">
      <div className="flex flex-1 overflow-hidden max-h-full">
        {/* Sidebar - Online Users (hidden on mobile when closed) */}        <aside
          className={`bg-white dark:bg-zinc-900 flex flex-col border-r border-gray-200 dark:border-zinc-800 h-full overflow-hidden transition-all duration-300 
            md:w-64 md:relative md:translate-x-0 md:shadow-none
            ${sidebarOpen
              ? 'w-full absolute z-20 translate-x-0 shadow-xl'
              : 'w-64 absolute z-20 -translate-x-full shadow-xl'}`}
        >          <div className="p-4 bg-white dark:bg-zinc-900 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-700 dark:text-purple-400" />
                <h2 className="font-medium text-slate-900 dark:text-white">Online Users</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon" className="h-8 w-8"
                  onClick={() => setShowHelp(!showHelp)}
                  title="Help & Information"
                >
                  <HelpCircle className="h-4 w-4 text-slate-700 dark:text-purple-400" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  title="Logout"
                  className="h-8 cursor-pointer bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent text-slate-700 dark:text-purple-400"
                >
                  <LogOut className="h-4 w-4 text-slate-700 dark:text-purple-400" />
                </Button>
                {/* Close button for mobile */}
                <Button
                  variant="ghost"
                  size="icon" className="h-8 w-8 md:hidden"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4 text-slate-700 dark:text-purple-400" />
                </Button>
              </div>
            </div>
            <Separator className="my-2 bg-gray-200 dark:bg-zinc-700" />
          </div>          {showHelp ? (
            <HelpInfo className="mx-2 mb-4 overflow-y-auto" />
          ) : (
            <>
              <ScrollArea className="flex-1 overflow-hidden">
                <UserList
                  users={users}
                  selectedUserId={selectedUser}
                  onSelectUser={handleSelectUser}
                />
              </ScrollArea>
              <ConnectionStats />
            </>
          )}
        </aside>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-zinc-950">
          {/* Mobile header with menu button */}
          <div className="p-3 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2 shrink-0 md:hidden bg-white dark:bg-zinc-900">
            <Button
              variant="ghost"
              size="icon" className="h-8 w-8 mr-1"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5 text-slate-700 dark:text-purple-400" />
            </Button>            {selectedUser && (
              <>
                <User className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                <span className="font-medium truncate text-slate-900 dark:text-white">
                  {users.find(u => u.id === selectedUser)?.name || selectedUser}
                </span>                
                <span className="text-xs ml-auto mr-2">
                  {webRTCService.isConnectedToPeer(selectedUser)
                    ? <span className="text-green-600 dark:text-green-400">(Connected)</span>
                    : <span className="text-amber-600 dark:text-yellow-400">(Connecting...)</span>}
                </span>
                
                {/* Close chat button for mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleCloseChat}
                  title="Close chat"
                >
                  <X className="h-4 w-4 text-slate-700 dark:text-purple-400" />
                </Button>
              </>
            )}
          </div>

          {selectedUser ? (
            <>              {/* Chat Header (desktop only) */}
              <div className="p-3 border-b border-gray-200 dark:border-zinc-800 hidden md:flex items-center gap-2 shrink-0 bg-white dark:bg-zinc-900">
                <User className="h-5 w-5 text-blue-600 dark:text-purple-400" />
                <span className="font-medium text-slate-900 dark:text-white">
                  {users.find(u => u.id === selectedUser)?.name || selectedUser}
                </span>
                <span className="text-xs ml-2">
                  {selectedUser && webRTCService.isConnectedToPeer(selectedUser)
                    ? <span className="text-green-600 dark:text-green-400">(Connected)</span>
                    : <span className="text-amber-600 dark:text-yellow-400">(Connecting...)</span>}
                </span>
                
                {/* Close chat button for desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-auto"
                  onClick={handleCloseChat}
                  title="Close chat"
                >
                  <X className="h-4 w-4 text-slate-700 dark:text-purple-400" />
                </Button>
              </div>{/* Messages */}
              <ScrollArea className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-50 dark:bg-zinc-950">
                <div className="flex flex-col gap-3 min-h-full">
                  {messages.length > 0 ? (
                    messages.map(msg => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                      />
                    ))
                  ) : (
                    <div className="text-center text-slate-500 dark:text-zinc-400 py-8">
                      Start a conversation with {users.find(u => u.id === selectedUser)?.name || selectedUser}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-zinc-800 p-2 sm:p-3 flex gap-2 shrink-0 bg-white dark:bg-zinc-900">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-slate-900 dark:text-white focus-visible:ring-purple-500 dark:focus-visible:ring-purple-500"
                  disabled={!selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!message.trim() || !selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
                  className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white min-w-9 sm:min-w-10 h-10 flex items-center justify-center"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Mobile header when no chat is selected */}
              <div className="p-3 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-2 shrink-0 md:hidden bg-white dark:bg-zinc-900">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 mr-1"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5 text-slate-700 dark:text-purple-400" />
                </Button>
                <span className="font-medium text-slate-900 dark:text-white">Select a chat</span>
              </div>
              <EmptyChat />
            </>
          )}        </main>
      </div>
        {/* Connection Request Dialog */}
      <ConnectionRequestDialog
        request={connectionRequest}
        onAccept={handleAcceptConnection}
        onReject={handleRejectConnection}
        onClose={handleIgnoreConnection}
      />
      
      {/* Pending Requests Notification */}
      <PendingRequestsNotification />
    </div>
  );
};

export default Chat;
