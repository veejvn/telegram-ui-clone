import React from "react";
import * as sdk from "matrix-js-sdk";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  BellOff,
  Ellipsis,
  Hand,
  Music,
  Phone,
  Search,
  Video,
} from "lucide-react";
import { MainMuteModal, MuteOptionsModal, MuteUntilPicker } from "./MuteModal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { usePresenceContext } from "@/contexts/PresenceProvider";
import { getDetailedStatus } from "@/utils/chat/presenceHelpers";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useIgnoreStore } from "@/stores/useIgnoreStore";

const mediaItems = [
  {
    id: 1,
    name: "Youtube",
    url: "http://youtube.com",
    icon: "Y",
    bgColor: "bg-gray-100",
  },
  {
    id: 2,
    name: "Google",
    url: "http://google.com",
    icon: "G",
    bgColor: "bg-gray-100",
  },
  {
    id: 3,
    name: "Matrix",
    url: "http://Matrix.org",
    icon: "M",
    bgColor: "bg-gray-100",
  },
];

export default function InfoBody({ user }: { user: sdk.User }) {
  const { getLastSeen } = usePresenceContext() || {};
  const lastSeen =
    user?.userId && getLastSeen ? getLastSeen(user.userId) : null;
  const matrixClient = useMatrixClient();

  // State cho modal mute và trạng thái mute
  const [showMainMuteModal, setShowMainMuteModal] = React.useState(false);
  const [showMuteOptions, setShowMuteOptions] = React.useState(false);
  const [showMuteUntil, setShowMuteUntil] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [muteUntil, setMuteUntil] = React.useState<Date | null>(null);
  const [muteBanner, setMuteBanner] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!muteBanner) return;

    const timer = setTimeout(() => {
      setMuteBanner(null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [muteBanner]);

  // Load trạng thái mute từ localStorage khi mở lại trang
  React.useEffect(() => {
    if (!user?.userId) return;

    const stored = localStorage.getItem(`mute-${user.userId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setIsMuted(data.isMuted);
        if (data.muteUntil) {
          const muteUntilDate = new Date(data.muteUntil);
          if (muteUntilDate > new Date()) {
            setMuteUntil(muteUntilDate);
          } else {
            // Hết hạn thì reset
            setIsMuted(false);
            setMuteUntil(null);
            localStorage.removeItem(`mute-${user.userId}`);
          }
        }
      } catch (e) {
        console.error("Failed to parse mute data", e);
      }
    }
  }, [user?.userId]);

  // State cho block modal và trạng thái block
  const [showBlockModal, setShowBlockModal] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);

  // State cho xác nhận unblock
  const [showConfirmUnblock, setShowConfirmUnblock] = React.useState(false);

  // State cho active feature (nếu cần dùng)
  const [activeFeature, setActiveFeature] = React.useState<string | null>(null);

  // Kiểm tra user đã bị block chưa khi load component
  React.useEffect(() => {
    if (!matrixClient || !user?.userId) return;
    const ignored = matrixClient.getIgnoredUsers?.() || [];
    setIsBlocked(ignored.includes(user.userId));
    useIgnoreStore.getState().setIgnoredUsers(ignored); // Đồng bộ store
  }, [matrixClient, user?.userId]);

  // Kiểm tra trạng thái mute khi load component
  React.useEffect(() => {
    if (!muteUntil) return;

    const now = new Date();
    if (muteUntil <= now) {
      setIsMuted(false);
      setMuteUntil(null);
      return;
    }

    const timeout = setTimeout(() => {
      setIsMuted(false);
      setMuteUntil(null);
    }, muteUntil.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [muteUntil]);

  // Hàm block user
  const handleBlockUser = async () => {
    if (!matrixClient || !user?.userId) return;
    const ignored = matrixClient.getIgnoredUsers?.() || [];

    if (!ignored.includes(user.userId)) {
      const updatedIgnored = [...ignored, user.userId];

      await matrixClient.setIgnoredUsers(updatedIgnored);
      setIsBlocked(true);

      // Cập nhật Zustand store
      useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
    }

    setShowBlockModal(false);
  };

  // Hàm unblock user
  const handleUnblockUser = async () => {
    if (!matrixClient || !user?.userId) return;
    const ignored = matrixClient.getIgnoredUsers?.() || [];

    const updatedIgnored = ignored.filter((id: string) => id !== user.userId);
    await matrixClient.setIgnoredUsers(updatedIgnored);
    setIsBlocked(false);

    // Cập nhật Zustand store
    useIgnoreStore.getState().setIgnoredUsers(updatedIgnored);
  };

  return (
    <>
      <div className="text-center px-4">
        <p className="text-xl font-semibold">
          {user.displayName || user.userId}
        </p>

        {/* add user's presence */}
        <p className="text-sm text-muted-foreground">
          {getDetailedStatus(lastSeen)}
        </p>

        {/* features */}
        <div className="flex justify-center gap-2 my-4">
          {/* CALL */}
          <div
            onClick={() => setActiveFeature("call")}
            className={`flex flex-col justify-end items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-black rounded-lg py-1 transition-all ${
              activeFeature && activeFeature !== "call"
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <Phone className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">call</p>
          </div>

          {/* VIDEO */}
          <div
            onClick={() => setActiveFeature("video")}
            className={`flex flex-col justify-end items-center w-[75px] h-[50px] cursor-pointer bg-white dark:bg-black rounded-lg py-1 transition-all ${
              activeFeature && activeFeature !== "video"
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <Video className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">video</p>
          </div>

          {/* MUTE */}
          <div
            onClick={() => {
              if (isMuted) {
                setIsMuted(false);
                setMuteUntil(null);
                localStorage.removeItem(`mute-${user.userId}`);
                setActiveFeature(null);
              } else {
                setActiveFeature("mute");
                setShowMainMuteModal(true);
              }
            }}
            className={`flex flex-col justify-end items-center w-[75px] h-[50px] group cursor-pointer bg-white dark:bg-black rounded-lg py-1 transition-all ${
              activeFeature && activeFeature !== "mute"
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
          >
            {isMuted ? (
              <>
                <BellOff className="text-[#155dfc]" />
                <p className="text-xs text-[#155dfc]">unmute</p>
              </>
            ) : (
              <>
                <Bell className="text-[#155dfc]" />
                <p className="text-xs text-[#155dfc]">mute</p>
              </>
            )}
          </div>

          {/* SEARCH */}
          <div
            onClick={() => setActiveFeature("search")}
            className={`flex flex-col justify-end items-center w-[75px] h-[50px] group cursor-pointer bg-white dark:bg-black rounded-lg py-1 transition-all ${
              activeFeature && activeFeature !== "search"
                ? "opacity-30 pointer-events-none"
                : ""
            }`}
          >
            <Search className="text-[#155dfc]" />
            <p className="text-xs text-[#155dfc]">search</p>
          </div>

          {/* MORE */}
          <Popover
            onOpenChange={(open) => {
              if (!open) setActiveFeature(null); // Reset làm mờ khi đóng popover
            }}
          >
            <PopoverTrigger asChild>
              <div
                onClick={() => setActiveFeature("more")}
                className={`flex flex-col justify-end items-center w-[75px] h-[50px] group cursor-pointer bg-white dark:bg-black rounded-lg py-1 transition-all ${
                  activeFeature && activeFeature !== "more"
                    ? "opacity-30 pointer-events-none"
                    : ""
                }`}
              >
                <Ellipsis className="text-[#155dfc]" />
                <p className="text-xs text-[#155dfc]">more</p>
              </div>
            </PopoverTrigger>
            <PopoverContent className="mr-4 p-0 w-[240px]">
              <div>
                <Button
                  className="flex justify-between items-center w-full my-1 text-red-500 bg-white dark:bg-black"
                  onClick={() => {
                    setShowBlockModal(true);
                  }}
                  disabled={isBlocked}
                >
                  Block User
                  <Hand />
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Thông tin số điện thoại và Unblock */}
        <div className="bg-white dark:bg-black ps-5 text-start py-4 flex flex-col mt-7 rounded-lg gap-3">
          <div>
            <p className="text-sm">mobile</p>
            <p className="text-[#155dfc] dark:bg-black">+84 11 222 33 44</p>
          </div>
          {isBlocked && (
            <>
              <hr className="my-2 border-gray-200" />
              <button
                onClick={() => setShowConfirmUnblock(true)}
                className="text-[#155dfc] text-base font-normal py-0 cursor-pointer text-left"
              >
                Unblock
              </button>
            </>
          )}
        </div>

        <div className="text-start py-4 flex flex-col rounded-lg gap-3">
          <Tabs defaultValue="media">
            <TabsList className="w-full h-12">
              <TabsTrigger
                value="media"
                className="data-[state=active]:text-[#155dfc] text-zinc-500"
              >
                Media
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="data-[state=active]:text-[#155dfc] text-zinc-500"
              >
                Links
              </TabsTrigger>
            </TabsList>
            <TabsContent value="media">
              <div className="grid grid-cols-3 gap-0.5 bg-white dark:bg-black p-1 rounded-lg">
                <div className="">
                  <Image
                    src="/images/folder.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/images/contact.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/images/logo.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/images/logo.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/images/contact.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
                <div>
                  <Image
                    src="/images/folder.png"
                    alt="image"
                    width={500}
                    height={500}
                  ></Image>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="link">
              <Card className="w-full max-w-md mx-auto bg-white dark:bg-black shadow-sm pt-3 pb-0">
                <CardContent className="px-2">
                  {/* Media Items */}
                  <div className="space-y-4">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4"
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-gray-600 font-semibold text-lg">
                            {item.icon}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium text-sm">
                            {item.name}
                          </span>
                          <a
                            href={item.url}
                            className="text-blue-500 text-sm hover:text-blue-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.url}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal mute main (có các lựa chọn như ảnh đầu tiên) */}
      <MainMuteModal
        open={showMainMuteModal}
        onClose={() => {
          setShowMainMuteModal(false);
          setActiveFeature(null);
        }}
        onSelect={(option) => {
          setShowMainMuteModal(false);
          if (option === "for") {
            setShowMuteOptions(true);
          } else {
            if (option === "forever") {
              const data = { isMuted: true, muteUntil: null };
              localStorage.setItem(`mute-${user.userId}`, JSON.stringify(data));
              setIsMuted(true);
              setMuteUntil(null);
              setMuteBanner("Notifications are muted.");
            }
            setActiveFeature(null);
          }
        }}
        onShowBanner={(msg) => {
          setMuteBanner(msg);
        }}
      />

      {/* Modal chọn thời gian mute */}
      <MuteOptionsModal
        open={showMuteOptions}
        onClose={() => {
          setShowMuteOptions(false);
          setActiveFeature(null);
        }}
        onBack={() => {
          setShowMuteOptions(false);
          setShowMainMuteModal(true);
        }}
        onSelect={(option) => {
          setShowMuteOptions(false);
          setActiveFeature(null);

          if (option === "disable") {
            const data = { isMuted: true, muteUntil: null };
            localStorage.setItem(`mute-${user.userId}`, JSON.stringify(data));
            setIsMuted(true);
            setMuteUntil(null);
            setMuteBanner("Notifications are disabled.");
            return;
          }

          if (option === "enable") {
            localStorage.removeItem(`mute-${user.userId}`);
            setIsMuted(false);
            setMuteUntil(null);
            setMuteBanner("Notifications are enabled.");
            return;
          }

          if (option === "until") {
            setShowMuteUntil(true);
            return;
          }

          if (option === "forever") {
            const data = { isMuted: true, muteUntil: null };
            localStorage.setItem(`mute-${user.userId}`, JSON.stringify(data));
            setIsMuted(true);
            setMuteUntil(null);
            setMuteBanner("Notifications are muted.");
            return;
          }

          if (option.endsWith("h")) {
            const hours = parseInt(option);
            const futureTime = new Date(Date.now() + hours * 60 * 60 * 1000);
            const data = {
              isMuted: true,
              muteUntil: futureTime.toISOString(),
            };
            localStorage.setItem(`mute-${user.userId}`, JSON.stringify(data));
            setMuteUntil(futureTime);
            setIsMuted(true);
            setMuteBanner(
              `Notifications are muted for ${hours} hour${
                hours > 1 ? "s" : ""
              }.`
            );
          }
        }}
      />

      <MuteUntilPicker
        open={showMuteUntil}
        onClose={() => {
          setShowMuteUntil(false);
          setActiveFeature(null);
        }}
        onSelect={(selectedTime: Date) => {
          setShowMuteUntil(false);
          setIsMuted(true);
          setMuteUntil(selectedTime);
          setActiveFeature(null);

          const day = String(selectedTime.getDate()).padStart(2, "0");
          const month = String(selectedTime.getMonth() + 1).padStart(2, "0");
          const year = selectedTime.getFullYear();
          const hour = String(selectedTime.getHours()).padStart(2, "0");
          const minute = String(selectedTime.getMinutes()).padStart(2, "0");

          const formatted = `${day}/${month}/${year}, ${hour}:${minute}`;
          setMuteBanner(`Notifications are muted until ${formatted}.`);

          // Lưu trạng thái mute vào localStorage
          localStorage.setItem(
            `mute-${user.userId}`,
            JSON.stringify({
              isMuted: true,
              muteUntil: selectedTime.toISOString(),
            })
          );
        }}
      />

      {/* Modal xác nhận block user */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
          <div className="w-full max-w-md rounded-t-2xl bg-white dark:bg-[#23232b] p-6 pb-4">
            <p className="text-center text-base text-zinc-700 dark:text-zinc-200 mb-6">
              Do you want to block <b>{user.displayName || user.userId}</b> from
              messaging and calling you on Hii Chat?
            </p>
            <button
              className="w-full py-3 text-lg font-semibold text-red-600 bg-white dark:bg-[#23232b] rounded-xl mb-2 border border-red-200"
              onClick={handleBlockUser}
            >
              Block {user.displayName || user.userId}
            </button>
            <button
              className="w-full py-3 text-lg font-semibold text-blue-600 bg-white dark:bg-[#23232b] rounded-xl"
              onClick={() => {
                setShowBlockModal(false);
                setActiveFeature(null);
              }}
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
      {/* Hiển thị banner mute nếu có */}
      {muteBanner && (
        <div className="fixed bottom-4 left-0 w-full flex justify-center z-50">
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg"
            style={{
              background: "#3C3C3E", // màu xám đậm giống iOS
              color: "#fff",
              maxWidth: 400,
              minWidth: 280,
            }}
          >
            <Music size={20} className="mr-2" />
            <span className="whitespace-nowrap">{muteBanner}</span>
          </div>
        </div>
      )}
    </>
  );
}
