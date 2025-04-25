import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
export default function DiscordProfilePage() {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Left sidebar - Server list */}
      <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-3 space-y-2">
        {[1, 2, 3, 4].map((server) => (
          <div key={server} className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            S{server}
          </div>
        ))}
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-green-500 text-2xl">
          +
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Channel sidebar */}
        <div className="w-60 bg-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-700 font-semibold shadow-sm">
            Discord Server
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {['general', 'random', 'music', 'gaming'].map((channel) => (
              <div key={channel} className="px-2 py-1 rounded hover:bg-gray-700 cursor-pointer text-gray-300">
                # {channel}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-gray-700">
            {/* User profile mini */}
            <div className="flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer">
              <div className="relative">
                <img 
                  src="https://i.pravatar.cc/150?img=3" 
                  className="w-8 h-8 rounded-full"
                  alt="User avatar"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="ml-2">
                <div className="text-sm font-medium">AlexJohnson</div>
                <div className="text-xs text-gray-400">#0425</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-gray-700">
          {/* Messages header */}
          <div className="p-4 border-b border-gray-600 flex items-center">
            <div className="text-gray-400 mr-2">#</div>
            <div className="font-semibold">general</div>
            <div className="ml-4 text-sm text-gray-400">Channel description goes here</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex group">
                <div className="mr-4 flex-shrink-0 relative">
                  <img 
                    src={`https://i.pravatar.cc/150?img=${i % 5}`} 
                    className="w-10 h-10 rounded-full"
                    alt="User avatar"
                  />
                  {i === 0 && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-700"></div>
                  )}
                </div>
                <div>
                  <div className="flex items-baseline">
                    <div className="font-medium mr-2">User{i+1}</div>
                    <div className="text-xs text-gray-400">Today at {i+1}:00 PM</div>
                  </div>
                  <div className="text-gray-100">
                    This is a sample message in the Discord-like interface. 
                    {i % 3 === 0 && " This is a longer message to demonstrate how text wraps in the chat window."}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="p-4">
            <div className="bg-gray-600 rounded-lg p-1">
              <input 
                type="text" 
                placeholder={`Message #general`}
                className="w-full bg-transparent outline-none px-3 py-2 text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Right sidebar - User list */}
        <div className="w-60 bg-gray-800 p-3 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 mb-2">ONLINE — {[...Array(5)].length}</div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer">
              <div className="relative mr-2">
                <img 
                  src={`https://i.pravatar.cc/150?img=${i+10}`} 
                  className="w-8 h-8 rounded-full"
                  alt="User avatar"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div>
                <div className="text-sm">Friend{i+1}</div>
                <div className="text-xs text-gray-400">Playing Valorant</div>
              </div>
            </div>
          ))}

          <div className="text-xs font-semibold text-gray-400 mt-4 mb-2">OFFLINE — {[...Array(3)].length}</div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center py-1 px-2 rounded text-gray-400">
              <div className="relative mr-2">
                <img 
                  src={`https://i.pravatar.cc/150?img=${i+15}`} 
                  className="w-8 h-8 rounded-full opacity-60"
                  alt="User avatar"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="text-sm">OfflineUser{i+1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}