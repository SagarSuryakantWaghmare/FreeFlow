"use client";

import React, { useState } from 'react';
import { useWebRTC } from '@/providers/webrtc-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, MessageCircle, Clock } from 'lucide-react';

export const GroupList: React.FC = () => {
  const { groups, createGroup, joinGroup, openGroupChat } = useWebRTC();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup(newGroupName.trim(), newGroupDescription.trim() || undefined);
      setNewGroupName('');
      setNewGroupDescription('');
      setShowCreateForm(false);
    }
  };

  const formatLastActivity = (date?: Date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Group Chats</h1>
          <p className="text-muted-foreground mt-1">
            Join or create secure group conversations
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create Group
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Group</CardTitle>
            <CardDescription>
              Start a new secure group conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Input
                  placeholder="Group name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Description (optional)"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Group</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card 
            key={group.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openGroupChat(group)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                {group.isActive && (
                  <Badge variant="default" className="bg-green-500">
                    Active
                  </Badge>
                )}
              </div>
              {group.description && (
                <CardDescription>{group.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users size={14} />
                  <span>{group.members} member{group.members !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock size={14} />
                  <span>Last activity: {formatLastActivity(group.lastActivity)}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      openGroupChat(group);
                    }}
                  >
                    <MessageCircle size={14} />
                    Chat
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      joinGroup(group.id);
                    }}
                  >
                    Join
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first group to start chatting securely with others
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus size={16} className="mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GroupList;
