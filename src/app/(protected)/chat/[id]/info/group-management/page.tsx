"use client";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";

const GroupManagementPage = () => {
  const params = useParams();
  const roomId = decodeURIComponent(params.id as string);
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#c9dbed] to-[#e7d7c7]">
      {/* Header */}
      <div className="relative flex items-center justify-center py-3">
        <button
          className="absolute left-2 p-2 rounded-full bg-[#FFFFFF4D] flex items-center justify-center"
          aria-label="Back"
          onClick={() => window.history.back()}
        >
          <IoChevronBack className="text-[#1c1c1e]" />
        </button>
        <h1 className="text-center text-lg font-medium text-[#1c1c1e]">
          Group Management
        </h1>
      </div>

      <div className="w-full px-4 space-y-8 mt-6 pb-12">
        {/* Recommended by friends */}
        <div>
          <h2 className="font-medium text-sm mb-2 px-1 text-[#1c1c1e]">
            Recommended by friends
          </h2>
          <div className="bg-[#FFFFFF4D] backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
              <div>
                <p className="text-sm font-medium text-[#1c1c1e]">
                  Join Group by Request
                </p>
                <p className="text-xs text-[#8e8e93]">
                  You need to request to join this group
                </p>
              </div>
              <div className="relative inline-block w-12 h-7 rounded-full bg-[#3478F6]">
                <div className="absolute right-1 top-1 bg-white w-5 h-5 rounded-full"></div>
              </div>
            </div>
            <div
              className="flex items-center justify-between px-5 py-4"
              onClick={() =>
                router.push(`/chat/${roomId}/info/group-management/join-requests`)
              }
            >
              <div className="flex-shrink-1 mr-2 max-w-[70%]">
                <p className="text-sm font-medium text-[#1c1c1e]">
                  Join Requests
                </p>
                <p className="text-xs text-[#8e8e93]">
                  Accept join request from a new member
                </p>
              </div>
              <div className="flex items-center flex-shrink-0 whitespace-nowrap">
                <div className="bg-white rounded-full px-2 py-[1px] shadow-sm">
                  <span className="text-xs text-[#FF3B30] font-medium whitespace-nowrap">
                    6 requests
                  </span>
                </div>
                <IoChevronForward className="text-[#8e8e93] ml-1 text-sm flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Member Management section remains unchanged */}
        <div>
          <h2 className="font-medium text-sm mb-2 px-1 text-[#1c1c1e]">
            Member Management
          </h2>

          {/* First Card */}
          <div className="bg-[#FFFFFF4D] backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm w-full mb-3">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
              <div>
                <p className="text-sm font-medium text-[#1c1c1e]">
                  Group owner management
                </p>
                <p className="text-xs text-[#8e8e93]">
                  Control who joins, what they can do, and how they interact
                </p>
              </div>
              <IoChevronForward className="text-[#8e8e93]" />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#1c1c1e]">
                  Remove members
                </p>
                <p className="text-xs text-[#8e8e93]">
                  Permanently remove this person from the group
                </p>
              </div>
              <IoChevronForward className="text-[#8e8e93]" />
            </div>
          </div>

          {/* Second Card */}
          <div className="bg-[#FFFFFF4D] backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5]">
              <div>
                <p className="text-sm font-medium text-[#1c1c1e]">
                  Change group owner
                </p>
                <p className="text-xs text-[#8e8e93]">
                  Select a member to transfer group ownership
                </p>
              </div>
              <IoChevronForward className="text-[#8e8e93]" />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#FF3B30]">
                  Leave and End Group
                </p>
                <p className="text-xs text-[#8e8e93]">
                  This will remove all members and delete the group chat
                </p>
              </div>
              <IoChevronForward className="text-[#8e8e93]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupManagementPage;
