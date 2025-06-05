'use client';

import { ArrowLeft, Search, Paperclip, Mic, Smile } from 'lucide-react';

const SavedMessagePage = () => {
  return (
    <div className="bg-[url('/bg-doodles.png')] bg-cover bg-center relative pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 dark:bg-black/50">
        <button className="flex items-center space-x-1 text-blue-400">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="dark:text-white font-semibold">Saved Messages</h1>
        <Search size={20} className="text-blue-400" />
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] px-4">
        <div className="bg-gradient-to-b from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
          <div className="bg-gray-600 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h10a4 4 0 004-4M7 10V6a4 4 0 118 0v4" />
            </svg>
          </div>
          <h2 className="text-white font-bold mb-2">Your Cloud Storage</h2>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Forward messages here to save them</li>
            <li>• Send media and files to store them</li>
            <li>• Access this chat from any device</li>
            <li>• Use search to quickly find things</li>
          </ul>
        </div>
      </div>

      {/* Message Input Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/60 px-4 py-2">
        <div className="flex items-center bg-gray-800 rounded-full px-3 py-2">
          {/* Attach icon */}
          <button className="text-gray-400 hover:text-gray-200" title="Attach file">
            <Paperclip size={20} />
          </button>

          {/* Input */}
          <input
            type="text"
            placeholder="Message"
            className="flex-1 bg-transparent px-3 text-white placeholder-gray-400 focus:outline-none"
          />

          {/* Smile icon */}
          <button className="text-gray-400 hover:text-gray-200 mr-2" title='Add emoji'>
            <Smile size={20} />
          </button>

          {/* Mic icon */}
          <button className="text-gray-400 hover:text-gray-200" title='Record voice message'>
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedMessagePage;
