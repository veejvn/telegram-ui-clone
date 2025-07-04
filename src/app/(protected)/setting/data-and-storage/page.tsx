"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";
import {
  ChevronRight,
  Cylinder,
  ChartNoAxesColumn,
  AudioLines,
  Wifi,
  RotateCcw,
  User,
  Users,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SettingItem = ({
  icon,
  title,
  value,
  onClick,
  showChevron = true, // thêm prop này, mặc định là true
  valueBelowTitle = false,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  value?: string;
  onClick?: () => void;
  showChevron?: boolean;
  valueBelowTitle?: boolean;
}) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-lg mb-2 cursor-pointer"
  >
    <div className="flex items-center gap-3 flex-1">
      {icon}
      {valueBelowTitle ? (
        <div className="flex flex-col">
          <span className="text-black dark:text-white">{title}</span>
          {value && (
            <span className="text-zinc-400 dark:text-zinc-300 text-sm -mt-0.5">
              {value}
            </span>
          )}
        </div>
      ) : (
        <span className="text-black dark:text-white">{title}</span>
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
);

export default function DataAndStoragePage() {
  const router = useRouter();
  const [useLessData, setUseLessData] = useState(false);
  const [saveEditedPhotos, setSaveEditedPhotos] = useState(true);
  const [pauseMusic, setPauseMusic] = useState(true);
  const [raiseToListen, setRaiseToListen] = useState(true);

  return (
    <div className="bg-[#f6f6f6] dark:bg-black min-h-screen text-black dark:text-white px-4 pt-6 pb-24">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="text-blue-400 mr-4 cursor-pointer"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">
          Data and Storage
        </h1>
        <div className="w-12" />
      </div>

      {/* Storage & Network */}
      <div>
        <div
          onClick={() => router.push("/setting/data-and-storage/storage-usage")}
        >
          <SettingItem
            icon={
              <div className="border border-green-600 bg-green-600 rounded p-1">
                <Cylinder size={24} className="text-white" />
              </div>
            }
            title="Storage Usage"
            value="14 MB"
          />
        </div>

        <div
          onClick={() => router.push("/setting/data-and-storage/network-usage")}
        >
          <SettingItem
            icon={
              <div className="border  border-purple-600 bg-purple-600 rounded p-1">
                <ChartNoAxesColumn size={24} className="text-white" />
              </div>
            }
            title="Network Usage"
            value="19,2 MB"
          />
        </div>
      </div>

      {/* Automatic Download */}
      <div>
        <h2 className="text-sm text-zinc-400 mb-2">AUTOMATIC MEDIA DOWNLOAD</h2>
        <SettingItem
          icon={
            <div className="border border-green-600 bg-green-600 rounded p-1">
              <AudioLines size={24} className="text-white" />
            </div>
          }
          title="Using Cellular"
          value="Media (2,5 MB)"
          valueBelowTitle
          onClick={() =>
            router.push("/setting/data-and-storage/using-cellular")
          }
        />
        <SettingItem
          icon={
            <div className="border border-blue-500 bg-blue-500 rounded p-1">
              <Wifi size={24} className="text-white" />
            </div>
          }
          title="Using Wi-Fi"
          value="Media (15 MB), Files (3,0 MB)"
          valueBelowTitle
          onClick={() => router.push("/setting/data-and-storage/using-wifi")}
        />
        <SettingItem
          icon={
            <div className="p-1 opacity-40">
              <RotateCcw size={24} />
            </div>
          }
          title={
            <span className="opacity-40">Reset Auto-Download Settings</span>
          }
          value=""
          showChevron={false}
        />
      </div>

      {/* Save to Photos */}
      <div>
        <h2 className="text-sm text-zinc-400 mb-2">SAVE TO PHOTOS</h2>
        <SettingItem
          icon={
            <div className="border border-blue-500 bg-blue-500 rounded p-1">
              <User size={24} className="text-white" />
            </div>
          }
          title="Private Chats"
          value="Off"
          onClick={() => router.push("/setting/data-and-storage/private-chats")}
        />
        <SettingItem
          icon={
            <div className="border border-green-600 bg-green-600 rounded p-1">
              <Users size={24} className="text-white" />
            </div>
          }
          title="Group Chats"
          value="Off"
          onClick={() => router.push("/setting/data-and-storage/group-chats")}
        />
        <SettingItem
          icon={
            <div className="border border-orange-400 bg-orange-400 rounded p-1">
              <Megaphone size={24} className="text-white" />
            </div>
          }
          title="Channels"
          value="Off"
          onClick={() => router.push("/setting/data-and-storage/channels")}
        />
        <p className="text-xs text-zinc-400 mt-1">
          Automatically save all new photos and videos from these chats to your
          Photos app.
        </p>
      </div>

      {/* Use Less Data */}
      <div>
        <div className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 sm:px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-0">
            <span>Use Less Data for Calls</span>
            <Switch
              checked={useLessData}
              onChange={setUseLessData}
              className={`${
                useLessData ? "bg-green-500" : "bg-zinc-400"
              } relative inline-flex h-6 sm:h-7 w-11 sm:w-12 items-center rounded-full transition-colors`}
            >
              <span
                className={`${
                  useLessData
                    ? "translate-x-6 sm:translate-x-7"
                    : "translate-x-1"
                } inline-block h-4 sm:h-5 w-4 sm:w-5 transform bg-white rounded-full transition-transform`}
              />
            </Switch>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          Using less data may improve your experience on bad networks, but will
          slightly decrease audio and video quality.
        </p>
      </div>

      {/* Other */}
      <div>
        <h2 className="text-sm text-zinc-400 mt-4 mb-2">OTHER</h2>
        <SettingItem
          icon={""}
          title="Open Links in"
          value="Telegram"
          onClick={() => router.push("/setting/data-and-storage/web-browser")}
        />
        <SettingItem
          icon={""}
          title="Share Sheet"
          onClick={() => router.push("/setting/data-and-storage/share-sheet")}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-0 px-4 sm:px-5 py-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-lg mb-2">
          <span>Save Edited Photos</span>
          <div
            onClick={() => setSaveEditedPhotos(!saveEditedPhotos)}
            className={`w-11 sm:w-12 h-6 sm:h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              saveEditedPhotos ? "bg-green-500" : "bg-zinc-400"
            }`}
          >
            <div
              className={`bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                saveEditedPhotos ? "translate-x-5 sm:translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-0 px-4 sm:px-5 py-3 bg-white border-zinc-200bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-lg mb-2">
          <span>Pause Music While Recording</span>
          <div
            onClick={() => setPauseMusic(!pauseMusic)}
            className={`w-11 sm:w-12 h-6 sm:h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              pauseMusic ? "bg-green-500" : "bg-zinc-400"
            }`}
          >
            <div
              className={`bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                pauseMusic ? "translate-x-5 sm:translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-0 px-4 sm:px-5 py-3 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-lg mb-2">
          <span>Raise to Listen</span>
          <div
            onClick={() => setRaiseToListen(!raiseToListen)}
            className={`w-11 sm:w-12 h-6 sm:h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              raiseToListen ? "bg-green-500" : "bg-zinc-400"
            }`}
          >
            <div
              className={`bg-white w-4 sm:w-5 h-4 sm:h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                raiseToListen ? "translate-x-5 sm:translate-x-6" : ""
              }`}
            ></div>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          Raise to Listen allows you to quickly listen and reply to incoming
          audio messages by raising the phone to your ear.
        </p>
      </div>

      {/* Connection */}
      <div>
        <h2 className="text-sm text-zinc-400 mb-2">CONNECTION TYPE</h2>
        <SettingItem
          icon={""}
          title="Proxy"
          value="None"
          onClick={() => router.push("/setting/data-and-storage/proxy")}
        />
      </div>
    </div>
  );
}
