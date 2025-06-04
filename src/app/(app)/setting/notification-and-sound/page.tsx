"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Users, MessageCircle, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";

type NotificationToggleProps = {
  label: string;
  description?: string;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const NotificationToggle = ({
  label,
  description,
  enabled,
  setEnabled,
}: NotificationToggleProps) => (
  <div className="flex items-start justify-between py-3">
    <div>
      <p className="font-medium">{label}</p>
      {description && <p className="text-gray-400 text-sm">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer">
      <Input
        type="checkbox"
        className="sr-only peer"
        checked={enabled}
        onChange={() => setEnabled(!enabled)}
      />
      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
    </label>
  </div>
);

export default function NotificationSettings() {
  const [privateChats, setPrivateChats] = useState(true);
  const [groupChats, setGroupChats] = useState(true);
  const [channels, setChannels] = useState(true);
  const [stories, setStories] = useState(false);
  const [reactions, setReactions] = useState(true);

  const [inAppSounds, setInAppSounds] = useState(true);
  const [inAppVibrate, setInAppVibrate] = useState(false);
  const [inAppPreview, setInAppPreview] = useState(true);
  const [lockScreenNames, setLockScreenNames] = useState(true);
  const [includeChannels, setIncludeChannels] = useState(true);
  const [countUnread, setCountUnread] = useState(true);
  const [newContacts, setNewContacts] = useState(true);
  const router = useRouter();
  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="text-blue-400 mr-4"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">Notifications</h1>
        <div className="w-12" />
      </div>

      {/* Message Notifications */}

      <div className="space-y-2">
        <p className="text-gray-400 font-semibold uppercase text-sm px-1 mb-1 mt-4">
          MESSAGE NOTIFICATIONS
        </p>
        {/* Private Chats */}
        <button
          type="button"
          className="flex justify-between items-center p-4 border rounded-xl w-full focus:outline-none"
          onClick={() =>
            router.push("/setting/notification-and-sound/private-chats")
          }
        >
          <div className="flex items-center space-x-2">
            <User className="text-blue-400" />
            <span>Private Chats</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">{privateChats ? "On" : "Off"}</span>
            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        </button>
        {/* Group Chats */}
        <button
          type="button"
          className="flex justify-between items-center p-4 border rounded-xl w-full focus:outline-none"
          onClick={() =>
            router.push("/setting/notification-and-sound/group-chats")
          }
        >
          <div className="flex items-center space-x-2">
            <Users className="text-green-400" />
            <span>Group Chats</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">{groupChats ? "On" : "Off"}</span>
            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        </button>
        {/* Channels */}
        <button
          type="button"
          className="flex justify-between items-center p-4 border rounded-xl w-full focus:outline-none"
          onClick={() =>
            router.push("/setting/notification-and-sound/channels")
          }
        >
          <div className="flex items-center space-x-2">
            <MessageCircle className="text-purple-400" />
            <span>Channels</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">{channels ? "On" : "Off"}</span>
            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        </button>
        {/* Stories */}
        <button
          type="button"
          className="flex justify-between items-center p-4 border rounded-xl w-full focus:outline-none"
          onClick={() => router.push("/setting/notification-and-sound/stories")}
        >
          <div className="flex items-center space-x-2">
            <Bell className="text-yellow-400" />
            <span>Stories</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Top 5</span>
            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        </button>
        {/* Reactions */}
        <button
          type="button"
          className="flex justify-between items-center p-4 border rounded-xl w-full focus:outline-none"
          onClick={() =>
            router.push("/setting/notification-and-sound/reactions")
          }
        >
          <div className="flex items-center space-x-2">
            <Heart className="text-pink-500" />
            <span>Reactions</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">{reactions ? "On" : "Off"}</span>
            <span className="text-gray-400 text-lg">{">"}</span>
          </div>
        </button>
      </div>

      {/* In-App Notifications */}
      <p className="text-gray-400 font-semibold uppercase text-sm px-1 mb-1 mt-4">
        IN-APP NOTIFICATIONS
      </p>
      <div className="p-4 border rounded-xl divide-y space-y-3">
        <NotificationToggle
          label="In-App Sounds"
          enabled={inAppSounds}
          setEnabled={setInAppSounds}
          description={undefined}
        />
        <NotificationToggle
          label="In-App Vibrate"
          enabled={inAppVibrate}
          setEnabled={setInAppVibrate}
          description={undefined}
        />
        <NotificationToggle
          label="In-App Preview"
          enabled={inAppPreview}
          setEnabled={setInAppPreview}
          description={undefined}
        />
      </div>
      {/* Names on Lock Screen */}
      <div className="p-4 border rounded-xl space-y-3">
        <NotificationToggle
          label="Names on Lock Screen"
          enabled={lockScreenNames}
          setEnabled={setLockScreenNames}
        />
      </div>
      <p className="text-gray-400 text-sm mt-1">
        Display names in notifications when the device is locked. To disable,
        make sure that 'Show Previews' is also set to 'When Unlocked' or 'Never'
        in iOS Settings &gt; Notifications.
      </p>
      {/* Badge Counter */}
      <p className="text-gray-400 font-semibold uppercase text-sm px-1 mb-1 mt-4">
        Badge Counter
      </p>
      <div className="p-4 border divide-y rounded-xl space-y-3">
        <NotificationToggle
          label="Include Channels"
          enabled={includeChannels}
          setEnabled={setIncludeChannels}
          description={undefined}
        />
        <NotificationToggle
          label="Count Unread Messages"
          enabled={countUnread}
          setEnabled={setCountUnread}
          description={undefined}
        />
      </div>
      <p className="text-gray-400 text-sm mt-1">
        Switch off to show the number of unread chats instead of messages
      </p>
      {/* New Contacts */}
      <div className="p-4 border rounded-xl space-y-3">
        <NotificationToggle
          label="New Contacts"
          enabled={newContacts}
          setEnabled={setNewContacts}
        />
      </div>
      <p className="text-gray-400 text-sm mt-1">
        Receive push notifications when one of your contacts becomes available
        on Telegram.
      </p>

      {/* Reset */}
      <div className="pt-0">
        <button type="button" className="text-red-500 font-semibold w-full py-3 rounded-xl border transition text-left pl-4">
          Reset All Notifications
        </button>
        <p className="text-gray-400 text-sm mt-1">
          Undo all custom notification settings for your contacts, groups and
          channels.
        </p>
      </div>
      <div className="h-8"></div>
    </div>
  );
}
