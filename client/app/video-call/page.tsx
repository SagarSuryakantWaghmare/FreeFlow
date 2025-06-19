"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SimpleVideoCallLobby from '@/components/VideoCall/SimpleVideoCallLobby';
import SimpleVideoCallRoom from '@/components/VideoCall/SimpleVideoCallRoom';
import simpleVideoCallService, { VideoRoom } from '@/lib/SimpleVideoCallService';
import { useToast } from '@/hooks/use-toast';
import { useClerkAuth } from '@/hooks/use-clerk-auth';
import { getUserData } from "@/lib/utils/UserData";
import { Footer } from '@/components/Home/footer';

export default function VideoCallPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isSignedIn, isLoaded } = useClerkAuth();
  const [currentRoom, setCurrentRoom] = useState<VideoRoom | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { userId, username: userName } = getUserData();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use video calls",
        variant: "default"
      });
      router.push('/sign-in');
      return;
    }
    if (!isInitialized && isSignedIn) {
      setTimeout(() => {
        const { userId, username } = getUserData();
        if (userId && username) {
          simpleVideoCallService.initialize(userId, username);
          setIsInitialized(true);
        }
      }, 100);
    }
    const existingRoom = simpleVideoCallService.getCurrentRoom();
    if (existingRoom) {
      setCurrentRoom(existingRoom);
    }
    const handleRoomCreated = (room: VideoRoom) => setCurrentRoom(room);
    const handleRoomLeft = () => setCurrentRoom(null);
    const handleJoinApproved = (data: any) => {
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

  const handleRoomCreated = (roomId: string) => {
    toast({
      title: "Room Created!",
      description: `Room ID: ${roomId}`,
    });
  };
  const handleRoomJoinRequest = (roomId: string) => {
    // This is called when user initiates a join request
    // The actual joining is now handled automatically via service events
  };
  const handleLeaveRoom = () => {
    setCurrentRoom(null);
    toast({
      title: "Left Room",
      description: "You have left the video call",
    });
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Loading FreeFlow</h2>
          <p className="text-muted-foreground">Preparing your video call experience...</p>
        </div>
        <Footer />
      </div>
    );
  }
  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Authentication Required</h2>
          <p className="mb-4">Please sign in to use video calls</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="bg-[hsl(263.4,70%,50.4%)] hover:bg-[hsl(263.4,70%,45%)] px-6 py-2 rounded-lg transition-colors text-white font-semibold"
          >
            Sign In
          </button>
        </div>
        <Footer />
      </div>
    );
  }
  // No user info
  if (!userId || !userName) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05] items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>Loading User Info</h2>
          <p className="text-muted-foreground">Loading user information...</p>
        </div>
        <Footer />
      </div>
    );
  }
  // In a room
  if (currentRoom) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05]">
        <SimpleVideoCallRoom
          room={currentRoom}
          onLeave={handleLeaveRoom}
        />
        <Footer />
      </div>
    );
  }
  // Lobby
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-[hsl(263.4,70%,50.4%)/0.05]">
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
      <Footer />
    </div>
  );
}
