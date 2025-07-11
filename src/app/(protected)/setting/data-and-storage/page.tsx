"use client";

import { JSX, useState } from "react";
import { Switch } from "@headlessui/react";
import { ChevronRight, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";
import { useTheme } from "next-themes";

// ----- ICON COMPONENT -----
const SettingIcon = ({ type }: { type: string }) => {
  const iconSize = 22;
  const iconMap: Record<string, JSX.Element> = {
    reset: <RotateCcw className="text-zinc-400" size={iconSize} />,
  };
  return iconMap[type] || null;
};

// ----- ITEM COMPONENT -----
const SettingItem = ({
  title,
  value,
  onClick,
  showChevron = true,
  valueBelowTitle = false,
  noBorder = false,
  iconType,
  imgSrc,
  forceIconWrapper = false,
}: {
  title: string;
  value?: string;
  onClick?: () => void;
  showChevron?: boolean;
  valueBelowTitle?: boolean;
  noBorder?: boolean;
  iconType?: string;
  imgSrc?: string;
  forceIconWrapper?: boolean;
}) => (
  <div onClick={onClick} className="cursor-pointer">
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#18181b]">
      <div className="flex items-center gap-3 flex-1">
        {(imgSrc || iconType) &&
          (forceIconWrapper ? (
            <div className="w-[45px] h-[45px] flex items-center justify-center">
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={title}
                  width={200}
                  height={200}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-[36px] h-[36px] flex items-center justify-center">
                  <SettingIcon type={iconType ?? ""} />
                </div>
              )}
            </div>
          ) : imgSrc ? (
            <Image
              src={imgSrc}
              alt={title}
              width={36}
              height={36}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="w-[36px] h-[36px] flex items-center justify-center">
              <SettingIcon type={iconType ?? ""} />
            </div>
          ))}

        {valueBelowTitle ? (
          <div className="flex flex-col">
            <span className="text-black dark:text-white text-base">
              {title}
            </span>
            {value && (
              <span className="text-zinc-400 dark:text-zinc-400 text-sm -mt-0.5">
                {value}
              </span>
            )}
          </div>
        ) : (
          <span className="text-black dark:text-white text-base">{title}</span>
        )}
      </div>

      {!valueBelowTitle && (
        <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-300 text-sm">
          {value && <span>{value}</span>}
          {showChevron && <ChevronRight size={18} />}
        </div>
      )}

      {valueBelowTitle && showChevron && (
        <ChevronRight size={18} className="text-zinc-400 dark:text-zinc-300" />
      )}
    </div>

    {!noBorder && (
      <div className="ml-[64px] mr-4 h-px bg-zinc-200 dark:bg-zinc-700" />
    )}
  </div>
);

// ----- PAGE COMPONENT -----
export default function DataAndStoragePage() {
  const router = useRouter();
  const [useLessData, setUseLessData] = useState(false);
  const [saveEditedPhotos, setSaveEditedPhotos] = useState(true);
  const [pauseMusic, setPauseMusic] = useState(true);
  const [raiseToListen, setRaiseToListen] = useState(true);

  // --- Theme + status bar ---
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const headerStyle = getHeaderStyleWithStatusBar();

  return (
    <div className="bg-[#f6f6f6] dark:bg-black min-h-screen text-black dark:text-white px-4 pt-6 pb-24">
      <Head>
        <meta name="theme-color" content={isDark ? "#000" : "#f6f6f6"} />
      </Head>
      {/* Header né status bar */}
      <div className="flex items-center mb-4" style={headerStyle}>
        <button
          type="button"
          className="text-blue-500 mr-4"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-2xl font-bold flex-1 text-center">
          Data and Storage
        </h1>
        <div className="w-12" />
      </div>

      <div className="bg-white dark:bg-[#18181b] rounded-2xl mb-5">
        <SettingItem
          imgSrc="/chat/images/icons-datastorage/storage.png"
          title="Storage Usage"
          value="18,9 MB"
          onClick={() => router.push("/setting/data-and-storage/storage-usage")}
        />
        <SettingItem
          imgSrc="/chat/images/icons-datastorage/network.png"
          title="Network Usage"
          value="64,1 MB"
          onClick={() => router.push("/setting/data-and-storage/network-usage")}
          noBorder
        />
      </div>

      <h2 className="text-sm text-zinc-400 px-4 pt-3 pb-2">
        AUTOMATIC MEDIA DOWNLOAD
      </h2>
      <div className="bg-white dark:bg-[#18181b] rounded-2xl mb-5">
        <SettingItem
          imgSrc="/chat/images/icons-datastorage/cellular.png"
          title="Using Cellular"
          value="Media (2,5 MB)"
          valueBelowTitle
          onClick={() =>
            router.push("/setting/data-and-storage/using-cellular")
          }
        />
        <SettingItem
          imgSrc="/chat/images/icons-datastorage/wifi.png"
          title="Using Wi-Fi"
          value="Media (15 MB), Files (3,0 MB)"
          valueBelowTitle
          onClick={() => router.push("/setting/data-and-storage/using-wifi")}
        />
        <div className="opacity-50 pointer-events-none select-none">
          <SettingItem
            title="Reset Auto-Download Settings"
            valueBelowTitle
            showChevron={false}
            noBorder
            iconType="reset"
          />
        </div>
      </div>

      <h2 className="text-sm text-zinc-400 px-4 pt-3 pb-2">SAVE TO PHOTOS</h2>
      <div className="bg-white dark:bg-[#18181b] rounded-2xl">
        <SettingItem
          imgSrc="/chat/icons/private-chat.png"
          title="Private Chats"
          value="Off"
          forceIconWrapper
          onClick={() => router.push("/setting/data-and-storage/private-chats")}
        />
        <SettingItem
          imgSrc="/chat/icons/group-chat.png"
          title="Group Chats"
          value="Off"
          forceIconWrapper
          onClick={() => router.push("/setting/data-and-storage/group-chats")}
        />
        <SettingItem
          imgSrc="/chat/icons/channel.png"
          title="Channels"
          value="Off"
          noBorder
          forceIconWrapper
          onClick={() => router.push("/setting/data-and-storage/channels")}
        />
      </div>
      <p className="text-xs text-zinc-400 px-4 py-2 mb-5">
        Automatically save all new photos and videos from these chats to your
        Photos app.
      </p>

      <div className="bg-white dark:bg-[#18181b] rounded-2xl">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-black dark:text-white text-base">
            Use Less Data for Calls
          </span>
          <Switch
            checked={useLessData}
            onChange={setUseLessData}
            className={`${useLessData ? "bg-green-500" : "bg-zinc-400"
              } relative inline-flex h-8 w-12 items-center rounded-full transition-colors`}
          >
            <span
              className={`${useLessData ? "translate-x-5" : "translate-x-1"
                } inline-block h-7 w-7 transform bg-white rounded-full shadow transition-transform`}
            />
          </Switch>
        </div>
      </div>
      <p className="text-xs text-zinc-400 px-4 py-2 mb-5">
        Using less data may improve your experience on bad networks, but will
        slightly decrease audio and video quality.
      </p>

      <h2 className="text-sm text-zinc-400 px-4 pt-3 pb-2">OTHER</h2>
      <div className="bg-white dark:bg-[#18181b] rounded-2xl">
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-black dark:text-white text-base">
              Open Links in
            </span>
            <div className="flex items-center gap-1 text-zinc-400 dark:text-zinc-300 text-sm">
              <span>Telegram</span>
              <ChevronRight size={18} />
            </div>
          </div>
          <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-black dark:text-white text-base">
              Share Sheet
            </span>
            <ChevronRight
              size={18}
              className="text-zinc-400 dark:text-zinc-300"
            />
          </div>
          <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {[
          {
            label: "Save Edited Photos",
            state: saveEditedPhotos,
            toggle: setSaveEditedPhotos,
          },
          {
            label: "Pause Music While Recording",
            state: pauseMusic,
            toggle: setPauseMusic,
          },
          {
            label: "Raise to Listen",
            state: raiseToListen,
            toggle: setRaiseToListen,
          },
        ].map(({ label, state, toggle }, idx, arr) => (
          <div key={label} className="flex flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-black dark:text-white text-base">
                {label}
              </span>
              <div
                className="flex-shrink-0"
                style={{
                  width: 48,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  onClick={() => toggle(!state)}
                  className={`w-12 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${state ? "bg-green-500" : "bg-zinc-400"
                    }`}
                >
                  <div
                    className={`bg-white w-7 h-7 rounded-full shadow-md transform transition-transform duration-300 ${state ? "translate-x-5" : ""
                      }`}
                  />
                </div>
              </div>
            </div>
            {idx !== arr.length - 1 && (
              <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-700" />
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-zinc-400 px-4 py-2 mb-5">
        Raise to Listen allows you to quickly listen and reply to incoming audio
        messages by raising the phone to your ear.
      </p>

      <h2 className="text-sm text-zinc-400 px-4 pt-3 pb-2">CONNECTION TYPE</h2>
      <div className="bg-white dark:bg-[#18181b] rounded-2xl mb-3">
        <SettingItem
          title="Proxy"
          value="None"
          noBorder
          onClick={() => router.push("/setting/data-and-storage/proxy")}
        />
      </div>
    </div>
  );
}
