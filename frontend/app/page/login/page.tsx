"use client";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
  };

  const handleGoogleSignIn = () => {
    console.log("Signing in with Google");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-purple-900 text-white">
      <div className="w-full max-w-md p-8 bg-black rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6">Login to FreeFlow</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
            Login
          </Button>
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        <Button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center bg-white text-black hover:bg-gray-200">
          <FcGoogle className="mr-2 text-xl" /> Sign in with Google
        </Button>
      </div>
    </div>
  );
}
