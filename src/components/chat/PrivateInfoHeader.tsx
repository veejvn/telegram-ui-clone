import React, { useState } from "react";
// import { Avatar, AvatarFallback } from "../ui/ChatAvatar";
import { ChevronLeft, Ellipsis } from "lucide-react";
import { useRouter } from "next/navigation";
import * as sdk from "matrix-js-sdk";
// import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useParams } from "next/navigation";
import { CloseIcon } from "./icons/InfoIcons";
import { useIgnoreStore } from "@/stores/useIgnoreStore";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";

export default function PrivateInfoHeader({ user }: { user: sdk.User }) {
  const router = useRouter();
  const client = useMatrixClient();
  const params = useParams();
  const roomId = params.id;
  const [showModal, setShowModal] = useState(false);
  // State cho block modal và trạng thái block
  const [showBlockModal, setShowBlockModal] = React.useState(false);

  // State cho xác nhận unblock
  const [showConfirmUnblock, setShowConfirmUnblock] = React.useState(false);

  // Kiểm tra user đã bị block chưa khi load component
  React.useEffect(() => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];
    // setIsBlocked(ignored.includes(user.userId));
    useIgnoreStore.getState().setIgnoredUsers(ignored); // Đồng bộ store
  }, [client, user?.userId]);

  // Hàm block user
  const handleBlockUser = async () => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];

    if (!ignored.includes(user.userId)) {
      const updatedIgnored = [...ignored, user.userId];
      await client.setIgnoredUsers(updatedIgnored);
      // setIsBlocked(true);

      // Cập nhật Zustand store
      useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
    }

    setShowBlockModal(false);
  };

  // Hàm unblock user
  const handleUnblockUser = async () => {
    if (!client || !user?.userId) return;
    const ignored = client.getIgnoredUsers?.() || [];

    const updatedIgnored = ignored.filter((id: string) => id !== user.userId);
    await client.setIgnoredUsers(updatedIgnored);
    // setIsBlocked(false);

    // ✅ Cập nhật Zustand store
    useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 pointer-events-none transition-all duration-300 ${
          showModal ? "backdrop-blur-md bg-white/60" : "bg-transparent"
        }`}
      />
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#A4CFDE]">
        <div
          className={`absolute inset-0 w-full h-full pointer-events-none transition-all duration-300 ${
            showModal ? "backdrop-blur-md bg-white/60" : "bg-[#A4CFDE]"
          }`}
        />
        <div className="flex justify-between items-center relative py-2 px-2 z-10">
          <button
            onClick={() => router.back()}
            className="h-10 px-4 flex items-center gap-1 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
            aria-label="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/chat/${roomId}/info/edit`)}
              className="h-10 px-4 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
            >
              Edit
            </button>
            <button
              className="h-10 w-10 flex items-center justify-center border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
              onClick={() => setShowModal((v) => !v)}
            >
              {showModal ? <CloseIcon /> : <Ellipsis className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      {/* Đẩy nội dung xuống dưới header cố định */}
      <div style={{ marginTop: 80 }}></div>

      {/* Modal menu */}
      {showModal && (
        <div
          className="absolute right-4 top-16 z-50 flex justify-end w-full pointer-events-none"
          style={{ maxWidth: "434px" }}
        >
          <div
            className="bg-white rounded-[20px] shadow-lg py-[12px] px-0 w-[192px] flex flex-col gap-[8px] pointer-events-auto"
            style={{
              borderRadius: "20px",
              width: "192px",
              paddingTop: "12px",
              paddingBottom: "12px",
              background: "#fff",
            }}
          >
            <button className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-all">
              <span className="text-black text-[15px]">Share contact</span>
              {/* ...icon... */}
            </button>
            <button className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-all">
              <span className="text-black text-[15px]">Clear message</span>
              {/* ...icon... */}
            </button>
            <button
              className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-all"
              onClick={() => {
                setShowModal(false);
                setShowBlockModal(true);
              }}
            >
              <span className="text-red-500 text-[15px]">Block user</span>
              {/* ...icon... */}
            </button>
          </div>
        </div>
      )}

      {/* Modal xác nhận block user */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-md rounded-t-2xl bg-white dark:bg-[#23232b] p-6 pb-4">
            <p className="text-center text-base text-zinc-700 dark:text-zinc-200 mb-6">
              Do you want to block <b>{user.displayName || user.userId}</b> from
              messaging and calling you on Ting Tong Chat?
            </p>
            <button
              className="w-full py-3 text-lg font-semibold text-red-600 bg-white dark:bg-[#23232b] rounded-xl mb-2 border border-red-200"
              onClick={handleBlockUser}
            >
              Block {user.displayName || user.userId}
            </button>
            <button
              className="w-full py-3 text-lg font-semibold text-blue-600 bg-white dark:bg-[#23232b] rounded-xl"
              onClick={() => setShowBlockModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Modal xác nhận unblock user */}
      {showConfirmUnblock && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-[#23232b] w-80 rounded-2xl p-5 shadow-xl text-center">
            <p className="text-lg font-medium text-black dark:text-white mb-6">
              Unblock <b>{user.displayName || user.userId}</b>?
            </p>
            <div className="flex justify-between gap-3">
              <button
                onClick={() => setShowConfirmUnblock(false)}
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white 
      hover:border-[#155dfc] hover:bg-[#f0f6ff] focus:outline-none"
              >
                No
              </button>
              <button
                onClick={async () => {
                  await handleUnblockUser();
                  setShowConfirmUnblock(false);
                }}
                className="w-full py-2 text-base font-medium text-[#155dfc] rounded-lg border border-[#dcdcdc] bg-white 
      hover:border-[#155dfc] hover:bg-[#f0f6ff] focus:outline-none"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
