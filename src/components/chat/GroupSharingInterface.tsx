"use client";

import React from "react";
import { Copy, UserPlus, Share2, Link } from "lucide-react";

interface GroupSharingInterfaceProps {
  roomName: string;
  memberCount: number;
  creationDate?: string;
  creatorName?: string;
}

const GroupSharingInterface = ({
  roomName,
  memberCount,
  creationDate,
  creatorName,
}: GroupSharingInterfaceProps) => {
  const handleCopyLink = () => {
    // Mock copy link functionality
    navigator.clipboard.writeText(`https://example.com/join/${roomName}`);
  };

  const handleAddMember = () => {
    // Mock add member functionality
    console.log("Add member clicked");
  };

  const handleShareGroup = () => {
    // Mock share group functionality
    console.log("Share group clicked");
  };

  return (
    <div className="">
      {/* QR Code */}
      <div className="flex justify-center my-3">
        <div className="w-30 h-30 flex items-center justify-center">
          {/* Real QR Code from Wikipedia */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/41/QR_Code_Example.svg"
            alt="QR Code for group invitation"
            className="w-30 h-30"
          />
        </div>
      </div>

      {/* Description */}
      <div className="text-center mb-6">
        <p className="text-gray-800 font-medium mb-2 text-sm">
          Share a QR code to let people join your group
        </p>
        {creationDate && (
          <p className="text-gray-500 text-xs">Group created {creationDate}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCopyLink}
          className="flex flex-col items-center gap-1 w-27 h-16 p-3
          bg-white/50 hover:bg-gray-100 rounded-lg transition-colors
          border border-white shadow-md/5"
        >
          <Link className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 text-xs font-medium">Copy link</span>
        </button>

        <button
          onClick={handleAddMember}
          className="flex flex-col items-center gap-1 w-27 h-16 p-3
          bg-white/50 hover:bg-gray-100 rounded-lg transition-colors
          border border-white shadow-md/5"
        >
          <UserPlus className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 text-xs font-medium">Add member</span>
        </button>

        <button
          onClick={handleShareGroup}
          className="flex flex-col items-center gap-1 w-27 h-16 p-3
          bg-white/50 hover:bg-gray-100 rounded-lg transition-colors
          border border-white shadow-md/5"
        >
          <Share2 className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 text-xs font-medium">Share group</span>
        </button>
      </div>

      {/* Group Creation Log */}
      <div className="text-center text-gray-600 text-xs my-3">
        {creationDate && (
          <>
            {creationDate} <strong>{creatorName}</strong> created the group
          </>
        )}
      </div>
    </div>
  );
};

export default GroupSharingInterface;
