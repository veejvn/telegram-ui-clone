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
  X,
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState<
    string | null
  >(null);

  const memberCount = room.getJoinedMembers().length;
  const avatarUrl = room.getAvatarUrl(
    client?.getHomeserverUrl() || "",
    96,
    96,
    "crop"
  );

  // Get current user ID
  const currentUserId = client?.getUserId();

  const reportReasons = [
    "Spam or scam",
    "Harassment or bullying",
    "Fake information",
    "Inappropriate content",
    "Hate speech or violence",
    "Flag as inappropriate",
  ];

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

  const handleReportSubmit = () => {
    if (!selectedReportReason) return;

    // TODO: Implement actual report submission
    console.log("Report submitted:", selectedReportReason);
    setIsReportModalOpen(false);
    setSelectedReportReason(null);
  };

  return (
    <>
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
                <button
                  className="absolute bottom-0 right-0 w-8 h-8  rounded-full bg-white flex items-center justify-center"
                  aria-label="Change group avatar"
                  title="Change group avatar"
                >
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
                    aria-label="Group name input"
                  />
                  <button
                    onClick={handleSaveName}
                    className="text-blue-500 text-sm font-medium"
                    aria-label="Save group name changes"
                    title="Save group name changes"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 text-sm font-medium"
                    aria-label="Cancel group name editing"
                    title="Cancel group name editing"
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
                    aria-label="Edit group name"
                    title="Edit group name"
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9.12501 2.04506C9.12501 1.04306 7.91301 0.541306 7.20501 1.25006L3.83001 4.62506H2.38101C1.52526 4.62506 0.642506 5.12306 0.386006 6.05381C0.211988 6.68789 0.124198 7.34253 0.125006 8.00006C0.125006 8.67356 0.215756 9.32606 0.387506 9.94631C0.643256 10.8763 1.52601 11.3751 2.38176 11.3751H3.82926L7.20426 14.7501C7.91301 15.4588 9.12501 14.9571 9.12501 13.9551V2.04506ZM12.335 5.91506C12.2835 5.85979 12.2214 5.81546 12.1524 5.78472C12.0834 5.75398 12.0089 5.73744 11.9334 5.73611C11.8579 5.73478 11.7828 5.74867 11.7128 5.77696C11.6428 5.80525 11.5791 5.84736 11.5257 5.90078C11.4723 5.95419 11.4302 6.01782 11.4019 6.08786C11.3736 6.1579 11.3597 6.23292 11.3611 6.30845C11.3624 6.38397 11.3789 6.45846 11.4097 6.52746C11.4404 6.59646 11.4847 6.65856 11.54 6.71006L12.83 8.00006L11.54 9.29006C11.4847 9.34155 11.4404 9.40365 11.4097 9.47265C11.3789 9.54165 11.3624 9.61614 11.3611 9.69166C11.3597 9.76719 11.3736 9.84221 11.4019 9.91225C11.4302 9.9823 11.4723 10.0459 11.5257 10.0993C11.5791 10.1527 11.6428 10.1949 11.7128 10.2231C11.7828 10.2514 11.8579 10.2653 11.9334 10.264C12.0089 10.2627 12.0834 10.2461 12.1524 10.2154C12.2214 10.1846 12.2835 10.1403 12.335 10.0851L13.625 8.79506L14.915 10.0851C14.9665 10.1403 15.0286 10.1846 15.0976 10.2154C15.1666 10.2461 15.2411 10.2627 15.3166 10.264C15.3921 10.2653 15.4672 10.2514 15.5372 10.2231C15.6072 10.1949 15.6709 10.1527 15.7243 10.0993C15.7777 10.0459 15.8198 9.9823 15.8481 9.91225C15.8764 9.84221 15.8903 9.76719 15.8889 9.69166C15.8876 9.61614 15.8711 9.54165 15.8403 9.47265C15.8096 9.40365 15.7653 9.34155 15.71 9.29006L14.42 8.00006L15.71 6.71006C15.7653 6.65856 15.8096 6.59646 15.8403 6.52746C15.8711 6.45846 15.8876 6.38397 15.8889 6.30845C15.8903 6.23292 15.8764 6.1579 15.8481 6.08786C15.8198 6.01782 15.7777 5.95419 15.7243 5.90078C15.6709 5.84736 15.6072 5.80525 15.5372 5.77696C15.4672 5.74867 15.3921 5.73478 15.3166 5.73611C15.2411 5.73744 15.1666 5.75398 15.0976 5.78472C15.0286 5.81546 14.9665 5.85979 14.915 5.91506L13.625 7.20506L12.335 5.91506Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Mute group</span>
                </div>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isMuted ? "bg-blue-500" : "bg-white"
                  }`}
                  aria-label={isMuted ? "Unmute group" : "Mute group"}
                  title={isMuted ? "Unmute group" : "Mute group"}
                >
                  <div
                    className={`w-5 h-5 rounded-full transition-transform ${
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
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.1483 4.30852L9.63496 0.79517C9.50813 0.668212 9.30219 0.668212 9.17536 0.79517L9.16047 0.810056C8.94504 1.02542 8.82634 1.31191 8.82634 1.61653C8.82634 1.81279 8.8762 2.00111 8.96883 2.16811L5.2927 5.32308C5.01135 5.07164 4.65226 4.93402 4.2719 4.93402C3.86203 4.93402 3.47674 5.09361 3.187 5.38341L3.16497 5.40545C3.03801 5.53234 3.03801 5.73815 3.16497 5.86505L5.26976 7.96984L3.21983 10.0197C3.17881 10.0619 2.20852 11.0618 1.57061 11.8574C0.963122 12.615 0.84299 12.7537 0.836749 12.7609C0.723962 12.8894 0.730203 13.0831 0.850921 13.2044C0.914172 13.2679 0.997576 13.3 1.08124 13.3C1.15749 13.3 1.23394 13.2733 1.29544 13.2196C1.30083 13.2149 1.43644 13.097 2.1989 12.4857C2.99445 11.8478 3.99432 10.8775 4.03976 10.8332L6.08637 8.78658L8.07844 10.7786C8.14188 10.8422 8.22509 10.8739 8.30824 10.8739C8.39138 10.8739 8.47465 10.8422 8.53803 10.7786L8.56007 10.7566C8.84987 10.4669 9.00946 10.0815 9.00946 9.67171C9.00946 9.29136 8.87178 8.93226 8.6204 8.65091L11.7754 4.97478C11.9424 5.06741 12.1307 5.11727 12.327 5.11727C12.6316 5.11727 12.9181 4.99864 13.1334 4.78314L13.1483 4.76825C13.2753 4.64123 13.2753 4.43542 13.1483 4.30852Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <span className="text-white text-sm">Pin group to top</span>
                </div>
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isPinned ? "bg-blue-500" : "bg-white"
                  }`}
                  aria-label={
                    isPinned ? "Unpin group from top" : "Pin group to top"
                  }
                  title={isPinned ? "Unpin group from top" : "Pin group to top"}
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
                    <svg
                      width="14"
                      height="16"
                      viewBox="0 0 14 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M6.30845 0.6875C5.6207 0.6875 5.0342 1.18475 4.92095 1.86275L4.78745 2.66675C4.77245 2.75675 4.7012 2.86175 4.5647 2.92775C4.30771 3.05128 4.0605 3.1942 3.8252 3.35525C3.7007 3.4415 3.5747 3.44975 3.4877 3.4175L2.72495 3.131C2.41313 3.01418 2.06997 3.0118 1.75656 3.12428C1.44315 3.23676 1.17982 3.45681 1.01345 3.74525L0.321951 4.943C0.155518 5.23127 0.0967368 5.56923 0.156064 5.89677C0.215391 6.2243 0.38898 6.52017 0.645951 6.73175L1.27595 7.25075C1.3472 7.30925 1.40345 7.4225 1.39145 7.57325C1.37008 7.8576 1.37008 8.14315 1.39145 8.4275C1.4027 8.5775 1.3472 8.6915 1.2767 8.75L0.645951 9.269C0.38898 9.48058 0.215391 9.77645 0.156064 10.104C0.0967368 10.4315 0.155518 10.7695 0.321951 11.0577L1.01345 12.2555C1.17994 12.5438 1.44332 12.7637 1.75672 12.876C2.07012 12.9884 2.41322 12.9859 2.72495 12.869L3.4892 12.5825C3.57545 12.5503 3.70145 12.5592 3.8267 12.644C4.0607 12.8045 4.30745 12.9477 4.56545 13.0715C4.70195 13.1375 4.7732 13.2425 4.7882 13.334L4.9217 14.1373C5.03495 14.8153 5.62145 15.3125 6.3092 15.3125H7.6922C8.3792 15.3125 8.96645 14.8153 9.0797 14.1373L9.2132 13.3333C9.2282 13.2432 9.2987 13.1382 9.43595 13.0715C9.69395 12.9477 9.9407 12.8045 10.1747 12.644C10.3 12.5585 10.426 12.5503 10.5122 12.5825L11.2772 12.869C11.5888 12.9854 11.9316 12.9876 12.2447 12.8751C12.5578 12.7627 12.8209 12.5429 12.9872 12.2548L13.6795 11.057C13.8459 10.7687 13.9047 10.4308 13.8453 10.1032C13.786 9.7757 13.6124 9.47983 13.3555 9.26825L12.7255 8.74925C12.6542 8.69075 12.598 8.5775 12.61 8.42675C12.6313 8.1424 12.6313 7.85685 12.61 7.5725C12.598 7.4225 12.6542 7.3085 12.7247 7.25L13.3547 6.731C13.8857 6.2945 14.023 5.5385 13.6795 4.94225L12.988 3.7445C12.8215 3.45619 12.5581 3.2363 12.2447 3.12396C11.9313 3.01162 11.5882 3.01411 11.2765 3.131L10.5114 3.4175C10.426 3.44975 10.3 3.44075 10.1747 3.35525C9.93965 3.19422 9.69269 3.05131 9.43595 2.92775C9.2987 2.8625 9.2282 2.7575 9.2132 2.66675L9.07895 1.86275C9.02425 1.5343 8.85478 1.23591 8.60071 1.0207C8.34663 0.805489 8.02443 0.687417 7.69145 0.6875H6.3092H6.30845ZM6.99995 10.8125C7.74587 10.8125 8.46124 10.5162 8.98869 9.98874C9.51613 9.46129 9.81245 8.74592 9.81245 8C9.81245 7.25408 9.51613 6.53871 8.98869 6.01126C8.46124 5.48382 7.74587 5.1875 6.99995 5.1875C6.25403 5.1875 5.53866 5.48382 5.01121 6.01126C4.48377 6.53871 4.18745 7.25408 4.18745 8C4.18745 8.74592 4.48377 9.46129 5.01121 9.98874C5.53866 10.5162 6.25403 10.8125 6.99995 10.8125Z"
                        fill="white"
                      />
                    </svg>
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
                    <svg
                      width="16"
                      height="14"
                      viewBox="0 0 16 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.625 13.75C14.2217 13.75 14.794 13.5129 15.216 13.091C15.6379 12.669 15.875 12.0967 15.875 11.5V8.125C15.875 7.52826 15.6379 6.95597 15.216 6.53401C14.794 6.11205 14.2217 5.875 13.625 5.875H2.375C1.77826 5.875 1.20597 6.11205 0.78401 6.53401C0.362053 6.95597 0.125 7.52826 0.125 8.125V11.5C0.125 12.0967 0.362053 12.669 0.78401 13.091C1.20597 13.5129 1.77826 13.75 2.375 13.75H13.625ZM0.125 5.6095V2.5C0.125 1.90326 0.362053 1.33097 0.78401 0.90901C1.20597 0.487053 1.77826 0.25 2.375 0.25H6.40925C6.85654 0.250195 7.28546 0.427967 7.60175 0.74425L9.19325 2.335C9.29825 2.44075 9.4415 2.5 9.59075 2.5H13.625C14.2217 2.5 14.794 2.73705 15.216 3.15901C15.6379 3.58097 15.875 4.15326 15.875 4.75V5.6095C15.2569 5.05498 14.4554 4.74882 13.625 4.75H2.375C1.54459 4.74882 0.743127 5.05498 0.125 5.6095Z"
                        fill="white"
                      />
                    </svg>
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
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsReportModalOpen(true)}
                >
                  <div className="bg-gray-500/40 rounded-full p-1.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M1.25 0.6875C1.39918 0.6875 1.54226 0.746763 1.64775 0.852252C1.75324 0.957742 1.8125 1.10082 1.8125 1.25V1.655L3.191 1.31C4.88442 0.886594 6.67345 1.08292 8.23475 1.8635L8.31575 1.904C9.61037 2.5514 11.091 2.72444 12.5 2.393L14.8325 1.844C14.92 1.82348 15.0111 1.82422 15.0982 1.84615C15.1854 1.86808 15.266 1.91057 15.3333 1.97006C15.4007 2.02954 15.4528 2.1043 15.4853 2.18806C15.5178 2.27182 15.5298 2.36216 15.5203 2.4515C15.2412 5.02828 15.2424 7.62774 15.524 10.2043C15.539 10.3408 15.5035 10.4782 15.4242 10.5904C15.3449 10.7025 15.2273 10.7818 15.0935 10.8133L12.758 11.363C11.0927 11.7549 9.34269 11.5506 7.8125 10.7855L7.7315 10.745C6.41053 10.0844 4.89686 9.91818 3.464 10.2762L1.8125 10.6888V14.75C1.8125 14.8992 1.75324 15.0423 1.64775 15.1477C1.54226 15.2532 1.39918 15.3125 1.25 15.3125C1.10082 15.3125 0.957742 15.2532 0.852252 15.1477C0.746763 15.0423 0.6875 14.8992 0.6875 14.75V1.25C0.6875 1.17613 0.702049 1.10299 0.730318 1.03474C0.758586 0.966495 0.800019 0.904485 0.852252 0.852252C0.904485 0.800019 0.966495 0.758586 1.03474 0.730318C1.10299 0.702049 1.17613 0.6875 1.25 0.6875Z"
                        fill="white"
                      />
                    </svg>
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
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.72168 0.9375H3.27832C2.98181 0.937491 2.72599 0.937483 2.5153 0.954697C2.29292 0.972866 2.07173 1.01298 1.85889 1.12143C1.54137 1.28321 1.28321 1.54137 1.12143 1.85889C1.01298 2.07173 0.972866 2.29292 0.954697 2.5153C0.937483 2.72599 0.937491 2.98179 0.9375 3.2783V5.72168C0.937491 6.0182 0.937483 6.27401 0.954697 6.4847C0.972866 6.70709 1.01298 6.92827 1.12143 7.14111C1.28321 7.45863 1.54137 7.71679 1.85889 7.87857C2.07173 7.98702 2.29292 8.02714 2.5153 8.04531C2.72599 8.06252 2.98179 8.06251 3.27831 8.0625H5.72169C6.01821 8.06251 6.27401 8.06252 6.4847 8.04531C6.70709 8.02714 6.92827 7.98702 7.14111 7.87857C7.45863 7.71679 7.71679 7.45863 7.87857 7.14111C7.98702 6.92827 8.02714 6.70709 8.04531 6.4847C8.06252 6.27401 8.06251 6.01821 8.0625 5.72169V3.27831C8.06251 2.98179 8.06252 2.72599 8.04531 2.5153C8.02714 2.29292 7.98702 2.07173 7.87857 1.85889C7.71679 1.54137 7.45863 1.28321 7.14111 1.12143C6.92827 1.01298 6.70709 0.972866 6.4847 0.954697C6.27401 0.937483 6.01819 0.937491 5.72168 0.9375Z"
                        fill="white"
                      />
                      <path
                        d="M14.7217 0.9375H12.2783C11.9818 0.937491 11.726 0.937483 11.5153 0.954697C11.2929 0.972866 11.0717 1.01298 10.8589 1.12143C10.5414 1.28321 10.2832 1.54137 10.1214 1.85889C10.013 2.07173 9.97287 2.29292 9.9547 2.5153C9.93748 2.72599 9.93749 2.98178 9.9375 3.27829V5.72168C9.93749 6.01819 9.93748 6.27402 9.9547 6.4847C9.97287 6.70709 10.013 6.92827 10.1214 7.14111C10.2832 7.45863 10.5414 7.71679 10.8589 7.87857C11.0717 7.98702 11.2929 8.02714 11.5153 8.04531C11.726 8.06252 11.9818 8.06251 12.2783 8.0625H14.7217C15.0182 8.06251 15.274 8.06252 15.4847 8.04531C15.7071 8.02714 15.9283 7.98702 16.1411 7.87857C16.4586 7.71679 16.7168 7.45863 16.8786 7.14111C16.987 6.92827 17.0271 6.70709 17.0453 6.4847C17.0625 6.27401 17.0625 6.01821 17.0625 5.72169V3.27831C17.0625 2.98179 17.0625 2.72599 17.0453 2.5153C17.0271 2.29292 16.987 2.07173 16.8786 1.85889C16.7168 1.54137 16.4586 1.28321 16.1411 1.12143C15.9283 1.01298 15.7071 0.972866 15.4847 0.954697C15.274 0.937483 15.0182 0.937491 14.7217 0.9375Z"
                        fill="white"
                      />
                      <path
                        d="M13.5 9.9375C11.5325 9.9375 9.9375 11.5325 9.9375 13.5C9.9375 15.4675 11.5325 17.0625 13.5 17.0625C15.4675 17.0625 17.0625 15.4675 17.0625 13.5C17.0625 11.5325 15.4675 9.9375 13.5 9.9375Z"
                        fill="white"
                      />
                      <path
                        d="M5.72168 9.9375H3.27832C2.98181 9.93749 2.72599 9.93748 2.5153 9.9547C2.29292 9.97287 2.07173 10.013 1.85889 10.1214C1.54137 10.2832 1.28321 10.5414 1.12143 10.8589C1.01298 11.0717 0.972866 11.2929 0.954697 11.5153C0.937483 11.726 0.937491 11.9818 0.9375 12.2783V14.7217C0.937491 15.0182 0.937483 15.274 0.954697 15.4847C0.972866 15.7071 1.01298 15.9283 1.12143 16.1411C1.28321 16.4586 1.54137 16.7168 1.85889 16.8786C2.07173 16.987 2.29292 17.0271 2.5153 17.0453C2.72599 17.0625 2.98179 17.0625 3.27831 17.0625H5.72169C6.01821 17.0625 6.27401 17.0625 6.4847 17.0453C6.70709 17.0271 6.92827 16.987 7.14111 16.8786C7.45863 16.7168 7.71679 16.4586 7.87857 16.1411C7.98702 15.9283 8.02714 15.7071 8.04531 15.4847C8.06252 15.274 8.06251 15.0182 8.0625 14.7217V12.2783C8.06251 11.9818 8.06252 11.726 8.04531 11.5153C8.02714 11.2929 7.98702 11.0717 7.87857 10.8589C7.71679 10.5414 7.45863 10.2832 7.14111 10.1214C6.92827 10.013 6.70709 9.97287 6.4847 9.9547C6.27402 9.93748 6.01819 9.93749 5.72168 9.9375Z"
                        fill="white"
                      />
                    </svg>
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
                            aria-label={`Chat with ${
                              member.name || member.userId
                            }`}
                            title={`Chat with ${member.name || member.userId}`}
                          >
                            Chat
                          </button>
                          <button
                            onClick={() => handleMoreOptions(member)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            aria-label={`More options for ${
                              member.name || member.userId
                            }`}
                            title={`More options for ${
                              member.name || member.userId
                            }`}
                          >
                            <MoreHorizontal
                              size={16}
                              className="text-gray-500"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                    {index <
                      Math.min(4, room.getJoinedMembers().length - 1) && (
                      <div className="bg-gray-200 dark:bg-gray-700 h-[1px] my-1"></div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </ScrollArea>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 bg-[#FFFFFF4D] z-50 flex flex-col justify-end"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReportModalOpen(false);
          }}
        >
          <div
            className="w-full bg-[#e4e3df] rounded-t-2xl overflow-hidden animate-slide-up"
            style={{ animation: "slideUp 0.3s ease-out forwards" }}
          >
            <div className="relative border-b border-[#d1d1d6]">
              <h2 className="text-center py-4 text-lg font-medium text-[#1c1c1e]">
                Reason for reporting
              </h2>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="absolute right-3 top-3 p-1.5 bg-[#d1d1d6] rounded-full"
              >
                <X size={20} color="#1c1c1e" />
              </button>
            </div>

            <div className="px-2 py-3">
              {reportReasons.map((reason, index) => (
                <div
                  key={reason}
                  className={
                    index !== reportReasons.length - 1
                      ? "border-b border-[#d1d1d6]"
                      : ""
                  }
                >
                  <label className="flex items-center px-4 py-3.5 cursor-pointer">
                    <div className="w-6 h-6 rounded-full border border-[#8e8e93] flex items-center justify-center mr-4">
                      {selectedReportReason === reason && (
                        <div className="w-3.5 h-3.5 bg-[#007AFF] rounded-full"></div>
                      )}
                    </div>
                    <span className="text-[17px] text-[#1c1c1e]">{reason}</span>
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReportReason === reason}
                      onChange={() => setSelectedReportReason(reason)}
                      className="sr-only"
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2">
              <button
                onClick={handleReportSubmit}
                disabled={!selectedReportReason}
                className={`w-full py-3.5 rounded-full text-white font-medium text-base ${
                  selectedReportReason ? "bg-[#007AFF]" : "bg-[#007AFF]/50"
                }`}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupInfoBody;
