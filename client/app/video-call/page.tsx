"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SimpleVideoCallLobby from '@/components/VideoCall/SimpleVideoCallLobby';
import SimpleVideoCallRoom from '@/components/VideoCall/SimpleVideoCallRoom';
import simpleVideoCallService, { VideoRoom } from '@/lib/SimpleVideoCallService';
import { useToast } from '@/hooks/use-toast';
import { useClerkAuth } from '@/hooks/use-clerk-auth'
import { getUserData } from "@/lib/utils/UserData";

export default function VideoCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useClerkAuth();
  
  const [currentRoom, setCurrentRoom] = useState<VideoRoom | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Get user info for rendering (available after Clerk auth hook sets localStorage)
  const { userId, username: userName } = getUserData();
  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use video calls",
        variant: "destructive"
      });
      router.push('/sign-in');
      return;
    }    // Initialize video call service with stored user data
    if (!isInitialized && isSignedIn) {
      // Small delay to ensure localStorage is populated by useClerkAuth hook
      setTimeout(() => {
        const { userId, username } = getUserData();
        console.log('VideoCallPage: Getting user data from localStorage:', { userId, username });
        
        if (userId && username) {
          console.log('VideoCallPage: Initializing video call service with:', { userId, username });
          simpleVideoCallService.initialize(userId, username);
          setIsInitialized(true);
        } else {
          console.error('VideoCallPage: User data not available in localStorage. isSignedIn:', isSignedIn);
          console.log('VideoCallPage: All localStorage keys:', typeof window !== 'undefined' ? Object.keys(localStorage) : 'SSR');
        }
      }, 100);
    }

    // Check if there's an existing room
    const existingRoom = simpleVideoCallService.getCurrentRoom();
    if (existingRoom) {
      setCurrentRoom(existingRoom);
    }    // Set up event listeners
    const handleRoomCreated = (room: VideoRoom) => {
      setCurrentRoom(room);
    };

    const handleRoomLeft = () => {
      setCurrentRoom(null);
    };

    const handleJoinApproved = (data: any) => {
      console.log('VideoCallPage: Join approved, automatically entering room:', data);
      const currentRoom = simpleVideoCallService.getCurrentRoom();
      if (currentRoom) {
        setCurrentRoom(currentRoom);
        toast({
          title: "Joined Room!",
          description: `Successfully joined room: ${data.roomName || data.roomId}`,
        });
      }
    };

    const handleJoinRejected = (data: any) => {
      toast({
        title: "Join Request Rejected",
        description: "Your request to join the room was rejected",
        variant: "destructive"
      });
    };

    const handleJoinError = (data: any) => {
      toast({
        title: "Join Error",
        description: data.error || "Failed to join room",
        variant: "destructive"
      });
    };

    simpleVideoCallService.addEventListener('room_created', handleRoomCreated);
    simpleVideoCallService.addEventListener('room_left', handleRoomLeft);
    simpleVideoCallService.addEventListener('join_approved', handleJoinApproved);
    simpleVideoCallService.addEventListener('join_rejected', handleJoinRejected);
    simpleVideoCallService.addEventListener('join_error', handleJoinError);

    return () => {
      simpleVideoCallService.removeEventListener('room_created', handleRoomCreated);
      simpleVideoCallService.removeEventListener('room_left', handleRoomLeft);
      simpleVideoCallService.removeEventListener('join_approved', handleJoinApproved);
      simpleVideoCallService.removeEventListener('join_rejected', handleJoinRejected);
      simpleVideoCallService.removeEventListener('join_error', handleJoinError);
    };
  }, [isLoaded, isSignedIn, isInitialized, router, toast]);
  const generateUserId = (): string => {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  };  const handleRoomCreated = (roomId: string) => {
    toast({
      title: "Room Created!",
      description: `Room ID: ${roomId}`,
    });
  };

  const handleRoomJoinRequest = (roomId: string) => {
    // This is called when user initiates a join request
    // The actual joining is now handled automatically via service events
    console.log('VideoCallPage: Join request initiated for room:', roomId);
  };

  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    toast({
      title: "Left Room",
      description: "You have left the video call",
    });
  };

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated (this shouldn't happen due to useEffect redirect)
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to use video calls</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }  // Get user info for rendering
  // const { userId, username: userName } = getUserData(); // Moved to top of component

  // If we don't have user info, show loading
  if (!userId || !userName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  // If in a room, show the room component
  if (currentRoom) {
    return (
      <SimpleVideoCallRoom
        room={currentRoom}
        onLeave={handleLeaveRoom}
      />
    );
  }
  // Otherwise, show the lobby
  return (
    <div>
      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          right: '10px', 
          background: 'black', 
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px', 
          zIndex: 9999,
          fontSize: '12px'
        }}>
          <button 
            onClick={() => simpleVideoCallService.testConnection()}
            style={{ background: '#007bff', color: 'white', border: 'none', padding: '5px', borderRadius: '3px' }}
          >
            Test Connection
          </button>
          <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>
          <div>User: {userId || 'None'}</div>
        </div>
      )}
        <SimpleVideoCallLobby
        onRoomCreated={handleRoomCreated}
        onRoomJoined={handleRoomJoinRequest}
        userId={userId}
        userName={userName}
      />
    </div>
  );
}
