"use client";

import React, { useState } from "react";
import * as sdk from "matrix-js-sdk";
import {
  UserPlus,
  Share2,
  LogOut,
  VolumeX,
  Pin,
  Settings,
  FolderOpen,
  Flag,
  Grid3X3,
  Camera,
  Edit3,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/ChatAvatar";
import { ScrollArea } from "../ui/scroll-area";

interface GroupInfoBodyProps {
  room: sdk.Room;
}

const GroupInfoBody = ({ room }: GroupInfoBodyProps) => {
  const client = useMatrixClient();
  const [isMuted, setIsMuted] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [groupName, setGroupName] = useState(room.name || "Group Name");
  const [isEditing, setIsEditing] = useState(false);

  const memberCount = room.getJoinedMembers().length;
  const avatarUrl = room.getAvatarUrl(
    client?.getHomeserverUrl() || "",
    96,
    96,
    "crop"
  );

  // Get current user ID
  const currentUserId = client?.getUserId();

  const handleAddMember = () => {
    // TODO: Implement add member functionality
    console.log("Add member clicked");
  };

  const handleShareGroup = () => {
    // TODO: Implement share group functionality
    console.log("Share group clicked");
  };

  const handleLeaveGroup = () => {
    // TODO: Implement leave group functionality
    console.log("Leave group clicked");
  };

  const handleEditName = () => {
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (!client || !groupName.trim()) return;

    try {
      await client.setRoomName(room.roomId, groupName);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update group name:", error);
    }
  };

  const handleCancelEdit = () => {
    setGroupName(room.name || "Group Name");
    setIsEditing(false);
  };

  const handleChatWithMember = (member: sdk.RoomMember) => {
    // TODO: Implement chat with member functionality
    console.log("Chat with member:", member.userId);
  };

  const handleMoreOptions = (member: sdk.RoomMember) => {
    // TODO: Implement more options for member
    console.log("More options for member:", member.userId);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-4 p-4">
        {/* Group Information Card */}
        <div className="bg-white/45 border border-white/30 rounded-2xl p-4">
          {/* Group Avatar */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Group avatar" />
                ) : (
                  <AvatarFallback className="bg-blue-500 text-white text-5xl font-bold">
                    {room.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8  rounded-full bg-white flex items-center justify-center">
                <Camera size={16} className="text-blue-500" />
              </button>
            </div>
          </div>

          {/* Group Name */}
          <div className="flex items-center justify-center gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="text-center text-lg font-semibold bg-transparent border-b border-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="text-blue-500 text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {groupName}
                </span>
                <button
                  onClick={handleEditName}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Edit3 size={14} className="text-blue-500" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddMember}
            className="flex-1 flex flex-col items-center justify-center py-3 px-4 bg-white/45 border border-white/30 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <UserPlus size={18} className="text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-500">
              Add member
            </span>
          </button>

          <button
            onClick={handleShareGroup}
            className="flex-1 flex flex-col items-center justify-center py-3 px-4 bg-white/45 border border-white/30 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <Share2 size={18} className="text-blue-500 mb-1" />
            <span className="text-xs font-medium text-blue-500">
              Share group
            </span>
          </button>

          <button
            onClick={handleLeaveGroup}
            className="flex-1 flex flex-col items-center justify-center py-3 px-4 bg-white/45 border border-white/30 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut size={18} className="text-red-500 mb-1" />
            <span className="text-xs font-medium text-red-500">
              Leave group
            </span>
          </button>
        </div>

        {/* Group Settings Card */}
        <div className="bg-neutral-400/50 rounded-3xl py-4 px-3 backdrop-blur-sm">
          <div className="space-y-3">
            {/* Mute group */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <VolumeX size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">Mute group</span>
              </div>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isMuted ? "bg-blue-500" : "bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5  rounded-full transition-transform ${
                    isMuted
                      ? "translate-x-6 bg-white"
                      : "translate-x-0.5 bg-gray-500"
                  }`}
                />
              </button>
            </div>
            <div className="bg-white/30 text-white h-[1px] "></div>

            {/* Pin group to top */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <Pin size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">Pin group to top</span>
              </div>
              <button
                onClick={() => setIsPinned(!isPinned)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isPinned ? "bg-blue-500" : "bg-white"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-transform ${
                    isPinned
                      ? "translate-x-6 bg-white"
                      : "translate-x-0.5 bg-gray-500"
                  }`}
                />
              </button>
            </div>
            <div className="bg-white/30 text-white h-[1px] "></div>

            {/* Group Management */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <Settings size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">Group Management</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <ChevronLeft size={16} className="text-gray-400 rotate-180" />
              </div>
            </div>
            <div className="bg-white/30 text-white h-[1px] "></div>

            {/* Media, files, and links */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <FolderOpen size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">
                  Media, files, and links
                </span>
              </div>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            </div>
            <div className="bg-white/30 text-white h-[1px] "></div>

            {/* Report */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <Flag size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">Report</span>
              </div>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            </div>
            <div className="bg-white/30 text-white h-[1px] "></div>

            {/* Topics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gray-500/40 rounded-full p-1.5">
                  <Grid3X3 size={18} className="text-white" />
                </div>
                <span className="text-white text-sm">Topics</span>
              </div>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            </div>
          </div>
        </div>

        {/* Group Members Card */}
        <div className="bg-white/45 border border-white/30 rounded-3xl p-4 space-y-2">
          <h3 className="text-xs text-muted-foreground mb-4">
            Group Members ({memberCount})
          </h3>

          {room
            .getJoinedMembers()
            .slice(0, 5)
            .map((member, index) => {
              const avatarUrl = member.getAvatarUrl(
                client?.baseUrl || "", // required
                64, // width
                64, // height
                "crop", // resize method
                false, // allowDefault
                false // allowDirectLinks
              );

              // Check if this is the current user
              const isCurrentUser = member.userId === currentUserId;

              return (
                <div key={member.userId}>
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        {avatarUrl ? (
                          <AvatarImage
                            src={avatarUrl}
                            alt={member.name || member.userId}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <AvatarFallback className="bg-blue-500 text-white text-sm">
                            {member.name?.charAt(0).toUpperCase() ||
                              member.userId?.charAt(1).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white text-sm font-medium">
                          {member.name ||
                            member.userId.split(":")[0].replace(/^@/, "")}
                        </span>
                        {index === 0 && (
                          <span className="text-blue-500 text-xs">
                            Group owner
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Only show buttons if not current user */}
                    {!isCurrentUser && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleChatWithMember(member)}
                          className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => handleMoreOptions(member)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                        >
                          <MoreHorizontal size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {index < Math.min(4, room.getJoinedMembers().length - 1) && (
                    <div className="bg-gray-200 dark:bg-gray-700 h-[1px] my-1"></div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default GroupInfoBody;
