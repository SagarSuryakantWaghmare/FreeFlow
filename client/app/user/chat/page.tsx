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
    } username.current = storedUsername;
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
    };    // Set up auto-reconnection after WebSocket connects - increased delay for stability
    setTimeout(() => {
      // Wait for stable connection before auto-reconnecting
      const checkStabilityAndReconnect = () => {
        if (webSocketService.isConnectionStable()) {
          autoReconnectToPeers();
        } else if (webSocketService.isConnected()) {
          // Connected but not stable yet, wait a bit more
          setTimeout(checkStabilityAndReconnect, 2000);
        } else {
          // Not connected, skip auto-reconnect for now
          console.log("WebSocket not connected, skipping auto-reconnect");
        }
      };
      checkStabilityAndReconnect();
    }, 6000); // Initial delay before checking// Connect to WebSocket server with timeout
    let connectionTimeout: NodeJS.Timeout;

    // Set a timeout to handle connection attempts that take too long
    connectionTimeout = setTimeout(() => {
      if (!webSocketService.isConnected()) {
        setIsConnected(false);
        toast.error('Connection timeout - the server might be down or unreachable');
      }
    }, 10000); // Increased timeout to 10 seconds

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
      });// Set up WebRTC message handler
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
  }; const handleSelectUser = (userId: string) => {
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
  }, [selectedUser]); const handleLogout = () => {
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

    // Disconnect from group chat service
    groupChatService.disconnect();

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
      // Ensure WebSocket is connected before accepting
      if (!webSocketService.isConnected()) {
        toast.info("Reconnecting to accept connection request...");
        // Try to reconnect first
        webSocketService.connect(userId.current).then(() => {
          webRTCService.acceptConnectionRequest(connectionRequest.fromUserId);
          toast.success(`Accepted connection from ${connectionRequest.fromUserName}`);
        }).catch(err => {
          toast.error("Failed to reconnect. Please try again.");
          console.error("Reconnection failed:", err);
        });
      } else {
        webRTCService.acceptConnectionRequest(connectionRequest.fromUserId);
        toast.success(`Accepted connection from ${connectionRequest.fromUserName}`);
      }
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
    <div className="h-screen w-screen flex flex-col bg-white dark:bg-zinc-950 text-foreground dark:text-white overflow-hidden fixed inset-0">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-5 blur-3xl"></div>
      </div>
      
      {/* Main content with top spacing for navbar */}
      <div className="relative flex-1 flex overflow-hidden max-h-full pt-16 sm:pt-[64px]">        {/* Mobile hamburger menu */}
        <button
          className="fixed top-[68px] left-3 z-40 p-2 rounded-lg bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-zinc-700/50 shadow-lg md:hidden transition-all duration-200 hover:scale-105"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          type="button"
          style={{ display: sidebarOpen ? 'none' : 'flex' }}
        >
          <Menu className="h-5 w-5 text-slate-700 dark:text-purple-400" />
        </button>

        {/* Enhanced Sidebar */}
        <aside
          className={`bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex flex-col border-r border-gray-200/50 dark:border-zinc-700/50 h-[calc(100vh-64px)] overflow-y-auto transition-all duration-300 shadow-xl
            w-72 sm:w-80 fixed z-30 left-0 top-[64px] md:relative md:top-0 md:left-0 md:w-72 lg:w-80 md:z-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0`}
        >          {/* Enhanced Sidebar Header */}
          <div className="p-4 sm:p-6 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm shrink-0 border-b border-gray-200/50 dark:border-zinc-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20">
                  <Users className="h-5 w-5 text-[hsl(263.4,70%,50.4%)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">Online Users</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">{users.length} users online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-[hsl(263.4,70%,50.4%)] hover:bg-opacity-10 transition-colors"
                  onClick={() => setShowHelp(!showHelp)}
                  title="Help & Information"
                >
                  <HelpCircle className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Logout"
                  className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                </Button>
                {/* Enhanced mobile close button */}
                <Button
                  variant="ghost"
                  size="icon" 
                  className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 md:hidden transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4 text-slate-700 dark:text-zinc-300" />
                </Button>
              </div>
            </div>
          </div>{showHelp ? (
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
        </aside>        {/* Enhanced overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Enhanced Main Chat Area */}
        <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm shadow-2xl border border-gray-200/50 dark:border-zinc-700/50 rounded-tl-2xl md:rounded-none m-0">          {/* Enhanced Chat Header */}
          <div className="sticky top-0 z-10 p-3 sm:p-4 border-b border-gray-200/50 dark:border-zinc-700/50 flex items-center gap-3 shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm">
            <div className="flex items-center w-full pl-0 sm:pl-2">
              {selectedUser ? (
                <>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 border border-[hsl(263.4,70%,50.4%)] border-opacity-20 shrink-0">
                      <User className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate text-slate-900 dark:text-white text-sm sm:text-base">
                        {users.find(u => u.id === selectedUser)?.name || selectedUser}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className={`h-2 w-2 rounded-full ${
                          selectedUser && webRTCService.isConnectedToPeer(selectedUser)
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-amber-500 animate-pulse'
                        }`}></div>
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                          {selectedUser && webRTCService.isConnectedToPeer(selectedUser)
                            ? 'Connected'
                            : 'Connecting...'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                    onClick={handleCloseChat}
                    title="Close chat"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800">
                    <User className="h-4 w-4 text-gray-500 dark:text-zinc-400" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white text-sm sm:text-base">Select a chat</span>
                </div>
              )}
            </div>
          </div>          {/* Enhanced Messages Area */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm" 
               style={{ minHeight: '300px', maxHeight: 'calc(100vh - 220px)' }}>
            <div className="flex flex-col gap-3 sm:gap-4 min-h-full max-w-4xl mx-auto">
              {selectedUser && messages.length > 0 ? (
                messages.map(msg => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                  />
                ))
              ) : selectedUser ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-8 sm:py-12">
                    <div className="p-4 rounded-full bg-[hsl(263.4,70%,50.4%)] bg-opacity-10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <User className="h-8 w-8 text-[hsl(263.4,70%,50.4%)]" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      Start a conversation
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                      Send a message to {users.find(u => u.id === selectedUser)?.name || selectedUser}
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyChat />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>          {/* Enhanced Message Input */}
          {selectedUser && (
            <form onSubmit={handleSendMessage} className="sticky bottom-0 z-10 border-t border-gray-200/50 dark:border-zinc-700/50 p-3 sm:p-4 flex gap-3 shrink-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-lg">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 text-slate-900 dark:text-white focus-visible:ring-[hsl(263.4,70%,50.4%)] focus-visible:border-[hsl(263.4,70%,50.4%)] px-4 py-3 rounded-xl shadow-sm backdrop-blur-sm"
                  disabled={!selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={!message.trim() || !selectedUser || !webRTCService.isConnectedToPeer(selectedUser)}
                className="bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white min-w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          )}
        </main>
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
