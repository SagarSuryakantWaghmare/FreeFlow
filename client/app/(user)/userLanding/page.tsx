export default function SimpleMessagingPage() {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Left sidebar - Chats list */}
        <div className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Messages</h1>
            <div className="mt-2 relative">
              <input
                type="text"
                placeholder="Search messages"
                className="w-full p-2 pl-8 rounded-lg bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-4 h-4 absolute left-2 top-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
  
          <div className="overflow-y-auto h-[calc(100vh-120px)]">
            {/* Individual chat */}
            <div className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer bg-blue-50">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/150?img=5"
                  className="w-12 h-12 rounded-full"
                  alt="User avatar"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Sarah Miller</h3>
                  <span className="text-xs text-gray-500">2:30 PM</span>
                </div>
                <p className="text-sm text-gray-600 truncate">Hey, how's the project going?</p>
              </div>
            </div>
  
            {/* Group chat */}
            <div className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  TEAM
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">Design Team</h3>
                  <span className="text-xs text-gray-500">10:45 AM</span>
                </div>
                <p className="text-sm text-gray-600 truncate">Meeting at 3pm tomorrow</p>
              </div>
            </div>
  
            {/* More chats... */}
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <img
                  src={`https://i.pravatar.cc/150?img=${item + 10}`}
                  className="w-12 h-12 rounded-full"
                  alt="User avatar"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">User {item}</h3>
                    <span className="text-xs text-gray-500">Yesterday</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">Last message preview...</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 bg-white flex items-center">
            <img
              src="https://i.pravatar.cc/150?img=5"
              className="w-10 h-10 rounded-full"
              alt="User avatar"
            />
            <div className="ml-3">
              <h2 className="font-semibold text-gray-900">Sarah Miller</h2>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
  
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* Date divider */}
            <div className="flex justify-center my-4">
              <span className="px-2 py-1 bg-gray-200 rounded-full text-xs text-gray-600">Today</span>
            </div>
  
            {/* Incoming message */}
            <div className="flex mb-4">
              <img
                src="https://i.pravatar.cc/150?img=5"
                className="w-8 h-8 rounded-full mr-2"
                alt="User avatar"
              />
              <div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs">
                  <p>Hey there! How's it going?</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">10:30 AM</p>
              </div>
            </div>
  
            {/* Outgoing message */}
            <div className="flex justify-end mb-4">
              <div className="text-right">
                <div className="bg-blue-500 text-white p-3 rounded-lg rounded-tr-none shadow-sm max-w-xs">
                  <p>I'm doing great! Just working on that project we discussed.</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">10:32 AM</p>
              </div>
            </div>
  
            {/* Group of incoming messages */}
            <div className="flex mb-1">
              <img
                src="https://i.pravatar.cc/150?img=5"
                className="w-8 h-8 rounded-full mr-2"
                alt="User avatar"
              />
              <div>
                <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-sm max-w-xs">
                  <p>That's awesome! I was thinking we could add some new features:</p>
                </div>
              </div>
            </div>
            <div className="flex mb-4 pl-10"> {/* Adjusted left padding to align under avatar */}
              <div>
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs mt-1">
                  <p>1. Dark mode support</p>
                  <p>2. File sharing</p>
                  <p>3. Video calls</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">10:35 AM</p>
              </div>
            </div>
          </div>
  
          {/* Message input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 mx-2 p-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="p-2 text-blue-500 hover:text-blue-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }