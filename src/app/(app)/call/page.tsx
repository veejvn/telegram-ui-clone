"use client";
import React, { useState } from "react";
import { Phone, Video, Info, Settings, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";

interface CallHistory {
  id: string;
  name: string;
  type: "outgoing" | "incoming" | "missed";
  timestamp: string;
  duration?: string;
}

const callData: CallHistory[] = [
  {
    id: "1",
    name: "Thanh Thảo",
    type: "outgoing",
    timestamp: "Thu",
    duration: "2 sec"
  },
];

export default function CallPage() {
  const [showCalls, setShowCalls] = useState(false);
  const recentCalls = showCalls ? callData : [];

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          className="text-[#0A84FF]"
          onClick={() => setShowCalls(!showCalls)}
        >
          Edit
        </button>
        <div className="flex space-x-4 bg-[#1C1C1E] rounded-lg px-2 py-1">
          <span className="font-medium">All</span>
          <span className="text-gray-500">Missed</span>
        </div>
      </div>

      {recentCalls.length > 0 ? (
        <>
          {/* Recent Calls Section */}
          <div className="flex-1">
            <div className="px-4 py-2 text-gray-500 text-sm">
              RECENT CALLS
            </div>

            <div>
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12 bg-[#0A84FF] rounded-full flex items-center justify-center">
                        <AvatarFallback className="text-xl text-white">T</AvatarFallback>
                      </Avatar>
                      <div className="absolute -left-1 top-0">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-white">{call.name}</div>
                      <div className="text-sm text-gray-500">
                        Outgoing ({call.duration})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-500">{call.timestamp}</span>
                    <Info className="w-5 h-5 text-[#0A84FF]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Empty State */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="w-32 h-32 bg-yellow-400 rounded-full mb-4 flex items-center justify-center">
              <Phone className="w-16 h-16 text-white transform -rotate-45" />
            </div>
            <p className="text-gray-500 text-center text-lg">
              Your recent voice and video calls will appear here.
            </p>
          </div>

          {/* Start New Call Button */}
          <div className="flex justify-center mb-20">
            <button className="flex items-center text-[#0A84FF] space-x-2">
              <Phone className="w-6 h-6" />
              <span className="text-lg">Start New Call</span>
            </button>
          </div>
        </>
      )}

      {/* Home Indicator */}
      <div className="pb-1 flex justify-center">
        <div className="w-32 h-1 bg-gray-500 rounded-full"></div>
      </div>
    </div>
  );
}