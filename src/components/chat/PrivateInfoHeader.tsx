import InfoBody from "@/components/chat/InfoBody";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserInfoInPrivateRoom } from "@/services/chatService";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
export default function InfoPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = decodeURIComponent(params.id as string);
  const client = useMatrixClient();
  const [user, setUser] = useState<sdk.User | undefined>(undefined);
  const [scrollPosition, setScrollPosition] = useState(0);
  const maxHeaderHeight = 300; // Should match InfoBody's value

  // Pass this to InfoBody to receive scroll updates
  const handleScroll = (position: number) => {
    setScrollPosition(position);
  };

  // Handle edit button click
  const handleEditButtonClick = () => {
    // Your edit function here
    router.push(`/chat/${roomId}/info/edit`);
  };

  useEffect(() => {
    if (!roomId || !client) return;

    getUserInfoInPrivateRoom(roomId, client)
      .then((res) => {
        if (res.success) {
          setUser(res.user);
        } else {
          console.log("Error: ", res.err);
        }
      })
      .catch((res) => {
        console.log("Error: ", res.err);
      });
  }, [roomId, client]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <svg
          className="animate-spin h-12 w-12 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="24"
            cy="24"
            r="20"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M44 24c0-11.046-8.954-20-20-20v8a12 12 0 0112 12h8z"
          />
        </svg>
        <span className="text-lg text-gray-600 font-semibold">Loading...</span>
      </div>
    );
  }

  // Override backgroundColor based on scroll position
  const headerStyle: React.CSSProperties = {
    ...getHeaderStyleWithStatusBar(),
    backgroundColor: "transparent", // Luôn trong suốt để thấy avatar
    transition: "all 0.3s ease-out",
    zIndex: 60, // Z-index cao hơn InfoBody để chắc chắn nổi trên cùng
    position: "fixed", // Sử dụng fixed thay vì absolute
    width: "100%",
    pointerEvents: "none" as React.CSSProperties["pointerEvents"], // Quan trọng: cho phép click xuyên qua header vào content
  };
  const getButtonStyle = (isScrolled: boolean): React.CSSProperties => {
    return {
      pointerEvents: "auto" as React.CSSProperties["pointerEvents"],
      backgroundColor: isScrolled ? "transparent" : "rgba(0, 0, 0, 0.3)", // Loại bỏ background trắng
      color: isScrolled ? "#007AFF" : "white", // Đổi sang màu xanh iOS (#007AFF)
      borderRadius: "9999px",
      padding: isScrolled ? "4px 0" : "4px", // Giảm padding khi scroll
      boxShadow: "none", // Loại bỏ shadow
      transition: "all 0.3s ease-out",
      display: "flex",
      alignItems: "center",
    };
  };

  const buttonStyle: React.CSSProperties = {
    pointerEvents: "auto" as React.CSSProperties["pointerEvents"], // Cho phép tương tác với các nút
  };

  return (
    <div className={`flex flex-col h-screen bg-white dark:bg-black w-full`}>
      {" "}
      {/* Đổi bg-gray-200 thành bg-white */}
      {/* Header ở vị trí fixed để không chiếm không gian layout */}
      <header style={headerStyle}>
        <div className="flex items-center justify-between px-4 py-2">
          <Link href={`/chat/${roomId}`} className="flex items-center">
            <button
              style={getButtonStyle(scrollPosition > 0)}
              className={
                scrollPosition > 0 ? "font-medium flex items-center" : ""
              }
            >
              {scrollPosition > 0 ? (
                // Phiên bản khi scroll với mũi tên "<" và chữ "Back" màu xanh
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="mr-1"
                  >
                    {/* Path cho mũi tên < */}
                    <path
                      d="M11 2L5 8L11 14"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                    />
                  </svg>
                  <span>Back</span>
                </span>
              ) : (
                // Phiên bản ban đầu - mũi tên trắng khi chưa scroll
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  {/* Path cho mũi tên < lớn hơn khi chưa scroll */}
                  <path d="M15 4L7 12L15 20" />
                </svg>
              )}
            </button>
          </Link>

          <button
            onClick={handleEditButtonClick}
            style={getButtonStyle(scrollPosition > 0)}
            className={scrollPosition > 0 ? "font-medium" : ""}
          >
            Edit
          </button>
        </div>
      </header>
      {/* InfoBody chiếm toàn màn hình và không bị header che */}
      <div className="w-full h-full">
        <InfoBody user={user!} onScroll={handleScroll} maxHeaderHeight={300} />
      </div>
    </div>
  );
}
