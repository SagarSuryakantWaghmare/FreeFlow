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
import { Copy, Users, LogOut, Send } from 'lucide-react';

interface GroupChatRoomProps {
  groupId: string;
  groupName: string;
  userId: string;
  inviteLink?: string;
  onLeaveGroup: () => void;
}

export default function GroupChatRoom({ 
  groupId, 
  groupName, 
  userId, 
  inviteLink, 
  onLeaveGroup 
}: GroupChatRoomProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Ensure connection
        if (!groupChatService.isConnected()) {
          await groupChatService.connect();
        }
        
        setIsConnected(true);
        
        // Subscribe to group messages
        groupChatService.subscribeToGroup(groupId, (message: GroupMessage) => {
          setMessages(prev => [...prev, message]);
        });
        
        toast({
          title: "Connected",
          description: `Connected to group "${groupName}"`,
        });
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
      groupChatService.unsubscribeFromGroup(groupId);
    };
  }, [groupId, groupName, toast]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isConnected) return;

    const message: GroupMessage = {
      groupId,
      senderId: userId,
      content: newMessage.trim(),
    };

    groupChatService.sendMessage(message);
    setNewMessage('');
  };

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await groupChatService.leaveGroup(groupId, userId);
      toast({
        title: "Left Group",
        description: `You have left the group "${groupName}"`,
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
        title: "Copied",
        description: "Invite link copied to clipboard",
      });
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle>{groupName}</CardTitle>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
          </div>
          <div className="flex space-x-2">
            {inviteLink && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyInviteLink}
                className="flex items-center space-x-1"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Invite</span>
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLeaveGroup}
              disabled={isLeaving}
              className="flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLeaving ? 'Leaving...' : 'Leave'}</span>
            </Button>
          </div>
        </div>
        {inviteLink && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Invite Token: </span>
            <code className="bg-muted px-2 py-1 rounded text-xs">{inviteLink}</code>
          </div>
        )}
        <Separator />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.senderId === userId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === userId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.senderId !== userId && (
                      <div className="text-xs font-medium mb-1 opacity-70">
                        {message.senderId}
                      </div>
                    )}
                    <div className="text-sm">{message.content}</div>
                    {message.timestamp && (
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={!isConnected}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="sm"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
