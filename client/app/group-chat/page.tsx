"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import MultiGroupChatInterface from "@/components/GroupChat/MultiGroupChatInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Footer } from "@/components/Home/footer";

function GroupChatContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    if (isLoaded && user) {
      setUserId(user.emailAddresses[0]?.emailAddress || user.id);
    }
  }, [user, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-10 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-5 blur-3xl"></div>
        </div>
        
        <Card className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 shadow-2xl relative z-10 rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 px-8">
            <div className="w-16 h-16 bg-[hsl(263.4,70%,50.4%)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              Loading FreeFlow
            </h3>
            <p className="text-slate-600 dark:text-zinc-400 text-center text-sm">Setting up your group chat experience...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!user) {
    redirect("/sign-in");
    return null;
  }
  
  return <MultiGroupChatInterface userId={userId} />;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[hsl(263.4,70%,50.4%)] opacity-5 blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-gray-200/50 dark:border-zinc-700/50 shadow-2xl relative z-10 rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12 px-8">
          <div className="w-16 h-16 bg-[hsl(263.4,70%,50.4%)] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            Initializing Chat
          </h3>
          <p className="text-slate-600 dark:text-zinc-400 text-center text-sm mb-4">Preparing your group communication...</p>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-[hsl(263.4,70%,50.4%)] animate-pulse" />
            <span className="text-xs text-[hsl(263.4,70%,50.4%)] font-medium">Powered by FreeFlow</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GroupChatPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Suspense fallback={<LoadingFallback />}>
        <GroupChatContent />
      </Suspense>
      <Footer />
    </div>
  );
}
