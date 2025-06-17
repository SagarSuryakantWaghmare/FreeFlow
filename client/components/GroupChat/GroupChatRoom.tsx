"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import groupChatService, { GroupMessage } from '@/lib/GroupChatService';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, LogOut, Send, ArrowLeft, User, Sparkles, MessageCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { SafeLocalStorage } from '@/lib/utils/SafeLocalStorage';




interface GroupChatRoomProps {
  groupId: string;
  groupName: string;
  userId: string;
  inviteLink?: string;
  onLeaveGroup: () => void;
  isMultiChat?: boolean;
}


export default function GroupChatRoom({
  groupId,
  groupName,
  userId,
  inviteLink,
  onLeaveGroup,
  isMultiChat = false
}: GroupChatRoomProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isLoaded } = useUser();

  // Getting the current user information
  useEffect(() => {
    if (isLoaded && user) {
      console.log('Current user:', user);
      console.log('User email:', user.emailAddresses[0]?.emailAddress);
      console.log('User name:', user.firstName, user.lastName);
      console.log('User ID:', user.id);
      
      // You can access user data here
      // user.firstName, user.lastName, user.emailAddresses[0]?.emailAddress, etc.
    }
  }, [user, isLoaded]);  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Initialize service with userId
        groupChatService.initialize(userId);
        
        // Ensure connection
        if (!groupChatService.isConnected()) {
          await groupChatService.connect();
        }

        setIsConnected(true);
        
        // Load existing messages from storage first
        const storedMessages = groupChatService.getGroupMessages(groupId);
        const convertedMessages = storedMessages.map(msg => ({
          groupId: msg.groupId,
          senderId: msg.senderId,
          senderName: msg.senderName || msg.senderId,
          content: msg.content,
          timestamp: msg.timestamp
        }));
        setMessages(convertedMessages);
        
        // Mark group as active (for unread count management)
        groupChatService.setGroupActive(groupId);
        
        // Subscribe to group messages for real-time updates
        groupChatService.subscribeToGroup(groupId, (message: GroupMessage) => {
          console.log('GroupChatRoom received message:', message);
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const exists = prev.some(msg => 
              msg.senderId === message.senderId && 
              msg.content === message.content && 
              Math.abs((msg.timestamp?.getTime() || 0) - (message.timestamp?.getTime() || 0)) < 1000
            );
            
            if (!exists) {
              return [...prev, message];
            }
            return prev;
          });
        });

        // Auto-reconnect to previously connected groups
        if (!isMultiChat) {
          await groupChatService.autoReconnectGroups();
        }

        if (!isMultiChat) {
          toast({
            title: "Connected ✨",
            description: `Welcome to "${groupName}"`,
          });
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to group chat",
          variant: "destructive",
        });
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (!isMultiChat) {
        // Only unsubscribe if not in multi-chat mode
        groupChatService.unsubscribeFromGroup(groupId);
      } else {
        // In multi-chat mode, just mark as inactive
        groupChatService.setGroupInactive(groupId);
      }
    };
  }, [groupId, groupName, userId, toast, isMultiChat]);

  // Add effect to load messages on group change and handle persistence
  useEffect(() => {
    // Load messages whenever groupId changes
    const storedMessages = groupChatService.getGroupMessages(groupId);
    const convertedMessages = storedMessages.map(msg => ({
      groupId: msg.groupId,
      senderId: msg.senderId,
      senderName: msg.senderName || getUserDisplayName(msg.senderId),
      content: msg.content,
      timestamp: msg.timestamp
    }));
    setMessages(convertedMessages);
    
    // Scroll to bottom when messages load
    setTimeout(() => scrollToBottom(), 100);
  }, [groupId]);

  // Handle window reload/refresh persistence
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Ensure any pending state is saved
      if (messages.length > 0) {
        // Mark group as inactive when user leaves
        groupChatService.setGroupInactive(groupId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [groupId, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: GroupMessage = {
      groupId: groupId,
      senderId: userId,
      senderName: getUserDisplayName(userId),
      content: newMessage.trim(),
      timestamp: new Date()
    };
    
    console.log('Sending message with user info:', message);
    groupChatService.sendMessage(message);
    setNewMessage('');
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await groupChatService.leaveGroup(groupId, userId);
      toast({
        title: "Left Group",
        description: `You have left "${groupName}"`,
      });
      onLeaveGroup();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Copied! 📋",
        description: "Invite link copied to clipboard",
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };  const getUserDisplayName = (senderId: string) => {
    if (senderId === userId) {
      // Use the actual user's name if available, otherwise fallback to 'You'
      if (user?.firstName) {
        return user.firstName + (user.lastName ? ` ${user.lastName}` : '');
      }      // Try to get username from localStorage
      const username = SafeLocalStorage.getItem('username');
      if (username) return username;
      return 'You';
    }
    
    // For other users, try to extract meaningful name from email
    if (senderId.includes('@')) {
      const emailPart = senderId.split('@')[0];
      // Convert dot notation to space and capitalize
      return emailPart.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    }
    
    // Fallback to senderId
    return senderId;
  };
  const getUserInitials = (senderId: string, senderName?: string) => {
    if (senderId === userId) {
      // Use actual user initials if available
      if (user?.firstName) {
        const firstInitial = user.firstName.charAt(0).toUpperCase();
        const lastInitial = user.lastName ? user.lastName.charAt(0).toUpperCase() : '';
        return firstInitial + lastInitial;
      }
      return 'Y';
    }
    
    // Use senderName if available to generate initials
    if (senderName) {
      const nameParts = senderName.split(' ');
      if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[1].charAt(0).toUpperCase();
      }
      return senderName.charAt(0).toUpperCase();
    }
    
    return senderId.charAt(0).toUpperCase();
  };

  const shouldShowAvatar = (currentIndex: number) => {
    if (currentIndex === 0) return true;
    const currentMessage = messages[currentIndex];
    const previousMessage = messages[currentIndex - 1];
    return currentMessage.senderId !== previousMessage.senderId;
  };

  const shouldShowSenderName = (currentIndex: number) => {
    return shouldShowAvatar(currentIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[hsl(263.4,70%,50.4%)/0.1] rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto max-w-5xl relative z-10">        {/* Header with back button */}
        {!isMultiChat && (
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLeaveGroup}
              className="text-muted-foreground hover:text-foreground hover:bg-[hsl(263.4,70%,50.4%)/0.1] transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        )}

        {/* Chat Container */}
        <Card className="h-[calc(100vh-150px)] flex flex-col bg-card/50 backdrop-blur-sm border-2 border-[hsl(263.4,70%,50.4%)/0.1] shadow-2xl overflow-hidden">{/* Chat Header */}
          {/* Chat Header */}
          <CardHeader className="flex-shrink-0 bg-gradient-to-r from-[hsl(263.4,70%,50.4%)/0.05] to-[hsl(263.4,70%,50.4%)/0.1] border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle
                    className="text-2xl font-bold bg-gradient-to-r from-foreground to-[hsl(263.4,70%,50.4%)] bg-clip-text text-transparent"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {groupName}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={isConnected ? "default" : "secondary"}
                      className={`text-xs ${isConnected
                          ? "bg-[hsl(263.4,70%,50.4%)] text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConnected ? 'bg-green-400' : 'bg-gray-400'}`} />
                      {isConnected ? 'Connected' : 'Connecting...'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Group Chat</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {inviteLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyInviteLink}
                    className="border-[hsl(263.4,70%,50.4%)/0.3 text-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,50.4%)] hover:text-white transition-all duration-300"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleLeaveGroup}
                  disabled={isLeaving}
                  className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLeaving ? 'Leaving...' : 'Leave'}
                </Button>
              </div>
            </div>

            {inviteLink && (
              <div className="mt-3 p-3 bg-[hsl(263.4,70%,50.4%)/0.05] rounded-lg border border-[hsl(263.4,70%,50.4%)/0.1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Invite Token: </span>
                    <code className="bg-[hsl(263.4,70%,50.4%)/0.1 text-[hsl(263.4,70%,50.4%)] px-2 py-1 rounded text-xs font-mono">
                      {inviteLink}
                    </code>
                  </div>
                  <Sparkles className="h-4 w-4 text-[hsl(263.4,70%,50.4%)]" />
                </div>
              </div>
            )}
          </CardHeader>          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-6 max-h-full">
              <div className="py-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      No messages yet
                    </h3>
                    <p className="text-muted-foreground">Start the conversation! 💬</p>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const showAvatar = shouldShowAvatar(index);
                      const showSenderName = shouldShowSenderName(index);
                      const isOwnMessage = message.senderId === userId;

                      return (
                        <div
                          key={index}
                          className={`flex items-end space-x-3 ${isOwnMessage ? 'justify-end' : 'justify-start'
                            } ${showAvatar ? 'mb-6' : 'mb-2'} w-full`}
                        >
                          {/* Avatar for other users */}                          {!isOwnMessage && (
                            <div className={`flex-shrink-0 w-10 h-10 ${showAvatar
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                : 'bg-transparent'
                              } rounded-xl flex items-center justify-center text-sm font-bold text-white`}>
                              {showAvatar && getUserInitials(message.senderId, message.senderName)}
                            </div>
                          )}

                          <div className={`max-w-[70%] sm:max-w-md ${isOwnMessage ? 'order-first' : ''}`}>                            {showSenderName && (
                              <div className={`text-xs font-medium mb-2 px-1 ${isOwnMessage ? 'text-right text-[hsl(263.4,70%,50.4%)]' : 'text-left text-emerald-600'
                                }`}>
                                {message.senderName || getUserDisplayName(message.senderId)}
                              </div>
                            )}

                            <div className={`px-4 py-3 rounded-2xl shadow-lg break-words ${isOwnMessage
                                ? 'bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] text-white'
                                : 'bg-card border border-border'
                              } ${showAvatar ? 'rounded-bl-md' : ''}`}>
                              <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.content}</div>
                              {message.timestamp && (
                                <div className={`text-xs mt-2 ${isOwnMessage ? 'text-white/70' : 'text-muted-foreground'
                                  }`}>
                                  {formatTime(message.timestamp)}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Avatar for your own messages */}
                          {isOwnMessage && (
                            <div className={`flex-shrink-0 w-10 h-10 ${showAvatar
                                ? 'bg-gradient-to-br from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)]'
                                : 'bg-transparent'
                              } rounded-xl flex items-center justify-center text-sm font-bold text-white`}>
                              {showAvatar && getUserInitials(message.senderId)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t bg-gradient-to-r from-background to-[hsl(263.4,70%,50.4%)/0.02] p-6">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={!isConnected}
                    className="h-12 pr-12 bg-background/50 border-2 border-[hsl(263.4,70%,50.4%)/0.2 focus:border-[hsl(263.4,70%,50.4%)] transition-colors rounded-xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !isConnected}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-[hsl(263.4,70%,50.4%)] to-[hsl(263.4,70%,60.4%)] hover:from-[hsl(263.4,70%,45.4%)] hover:to-[hsl(263.4,70%,55.4%)] text-white border-0 rounded-lg h-8 w-8 p-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!isConnected && (
                <div className="text-center mt-3">
                  <span className="text-xs text-muted-foreground">Connecting to chat...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
