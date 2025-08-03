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
      <div className="flex justify-between items-center relative bg-transparent py-2 px-2 z-50">
        <button
          onClick={() => router.back()}
          className="h-10 px-4 flex items-center gap-1 text-sm font-medium border border-white rounded-full cursor-pointer bg-gradient-to-br from-slate-100/50 via-gray-400/10 to-slate-50/15 backdrop-blur-xs shadow-xs hover:scale-105 duration-300 transition-all ease-in-out"
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

      {/* Modal menu */}
      {showModal && (
        <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-md transition-all" />
      )}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
              >
                <path
                  d="M11.25 11.75L15.75 7.25M15.75 7.25L11.25 2.75M15.75 7.25H6.75C5.55653 7.25 4.41193 7.72411 3.56802 8.56802C2.72411 9.41193 2.25 10.5565 2.25 11.75C2.25 12.9435 2.72411 14.0881 3.56802 14.932C4.41193 15.7759 5.55653 16.25 6.75 16.25H9"
                  stroke="#026AE0"
                  strokeWidth="1.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-all">
              <span className="text-black text-[15px]">Clear message</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
              >
                <path
                  d="M1.6875 10.07C1.6875 11.27 2.52975 12.3155 3.71775 12.4903C4.533 12.6103 5.3565 12.7025 6.1875 12.767V16.25L9.2445 13.193C9.45182 12.987 9.73009 12.8681 10.0222 12.8608C11.4483 12.8213 12.8708 12.6976 14.2822 12.4903C15.4702 12.3155 16.3125 11.2708 16.3125 10.0693V5.55575C16.3125 4.35425 15.4702 3.3095 14.2822 3.13475C12.5332 2.87804 10.7678 2.74944 9 2.75C7.206 2.75 5.442 2.88125 3.71775 3.13475C2.52975 3.3095 1.6875 4.355 1.6875 5.55575V10.0693V10.07Z"
                  stroke="#026AE0"
                  strokeWidth="1.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 transition-all"
              onClick={() => {
                setShowModal(false); // Đóng menu
                setShowBlockModal(true); // Mở modal xác nhận block
              }}
            >
              <span className="text-red-500 text-[15px]">Block user</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="19"
                viewBox="0 0 18 19"
                fill="none"
              >
                <path
                  d="M13.773 14.273C15.0389 13.0072 15.7501 11.2903 15.7501 9.50004C15.7501 7.70982 15.0389 5.99292 13.773 4.72704C12.5072 3.46116 10.7903 2.75 9.00004 2.75C7.20982 2.75 5.49292 3.46116 4.22704 4.72704M13.773 14.273C12.5072 15.5389 10.7903 16.2501 9.00004 16.2501C7.20982 16.2501 5.49292 15.5389 4.22704 14.273C2.96116 13.0072 2.25 11.2903 2.25 9.50004C2.25 7.70982 2.96116 5.99292 4.22704 4.72704M13.773 14.273L4.22704 4.72704"
                  stroke="#FF434E"
                  strokeWidth="1.125"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
