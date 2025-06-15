"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Video, Users, Shield, Settings, ArrowRight } from 'lucide-react';

export default function VideoCallDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Simple Video Chat
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create secure video chat rooms with owner controls and seamless device management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/video-call">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg">
                <Video className="mr-2" size={20} />
                Start Video Chat
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Room Owner Controls</h3>
            <p className="text-gray-300">
              Create rooms and control who can join. Approve or reject join requests.
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 text-center">
            <Video className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">HD Video & Audio</h3>
            <p className="text-gray-300">
              Crystal clear video calls with professional audio quality.
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 text-center">
            <Settings className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Device Management</h3>
            <p className="text-gray-300">
              Switch cameras and microphones seamlessly during calls.
            </p>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 text-center">
            <Shield className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-300">
              Peer-to-peer connections with end-to-end encryption.
            </p>
          </Card>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6 text-blue-400">Create a Room</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Choose Room Name</h4>
                    <p className="text-gray-300">Give your video chat room a meaningful name</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Get Room ID</h4>
                    <p className="text-gray-300">Share the unique room ID with participants</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Control Access</h4>
                    <p className="text-gray-300">Approve or reject join requests as the room owner</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-6 text-green-400">Join a Room</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-semibold">Enter Room ID</h4>
                    <p className="text-gray-300">Use the room ID shared by the room owner</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-semibold">Request to Join</h4>
                    <p className="text-gray-300">Send a join request and wait for approval</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center jewelry justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-semibold">Start Chatting</h4>
                    <p className="text-gray-300">Once approved, enjoy your video chat!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/video-call">
            <Button size="lg" className="bg-purple-500 hover:bg-purple-600 text-white px-12 py-4 text-xl">
              Try It Now
              <ArrowRight className="ml-2" size={24} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
