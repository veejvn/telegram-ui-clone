"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, MessageCircle, Heart, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";

type NotificationToggleProps = {
  label: string;
  description?: string;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const NotificationToggle = ({
  label,
  description = "",
  enabled,
  setEnabled,
}: NotificationToggleProps) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-start justify-between py-3">
      <div>
        <p className="font-medium text-[15px] text-black dark:text-white">
          {label}
        </p>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {description}
          </p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer w-11 h-6">
        <Input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={() => setEnabled(!enabled)}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-300 ${enabled ? "bg-green-500" : isDark ? "bg-[#3a3a3c]" : "bg-[#d1d1d6]"
            }`}
        />
        <div className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-5" />
      </label>
    </div>
  );
};

export default function NotificationSettings() {
  const router = useRouter();
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

  const messageItems = [
    {
      label: "Private Chats",
      icon: (
        <img
          src="/chat/icons/private-chat.png"
          alt="Private Chat"
          className="w-9 h-9 object-cover rounded-[10px]"
        />
      ),
      iconBg: "", // Không cần nền vì PNG đã có
      value: privateChats,
      route: "private-chats",
      description: "1 exception",
    },
    {
      label: "Group Chats",
      icon: (
        <img
          src="/chat/icons/group-chat.png"
          alt="Group Chat"
          className="w-9 h-9 object-cover rounded-[10px]"
        />
      ),
      iconBg: "",
      value: groupChats,
      route: "group-chats",
    },
    {
      label: "Channels",
      icon: (
        <img
          src="/chat/icons/channel.png"
          alt="Channel"
          className="w-9 h-9 object-cover rounded-[10px]"
        />
      ),
      iconBg: "",
      value: channels,
      route: "channels",
    },
    {
      label: "Stories",
      icon: (
        <img
          src="/chat/icons/story.png"
          alt="Stories"
          className="w-9 h-9 object-cover rounded-[10px]"
        />
      ),
      iconBg: "",
      value: stories,
      route: "stories",
      customText: "Top 5",
    },
    {
      label: "Reactions",
      icon: (
        <img
          src="/chat/icons/reaction.png"
          alt="Reactions"
          className="w-12 h-12 object-cover rounded-[10px]"
        />
      ),
      iconBg: "",
      value: reactions,
      route: "reactions",
      description: "Messages, Stories",
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-y-auto bg-white dark:bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          type="button"
          className="text-blue-400 mr-4"
          onClick={() => router.push("/setting")}
        >
          &lt; Back
        </button>
        <h1 className="text-xl font-bold flex-1 text-center text-black dark:text-white">
          Notifications
        </h1>
        <div className="w-12" />
      </div>

      {/* Message Notifications */}
      <Section title="MESSAGE NOTIFICATIONS">
        <div className="overflow-hidden bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#d1d1d6] dark:border-[#2c2c2e]">
          {messageItems.map(
            ({ label, icon, value, route, customText, description }, idx) => (
              <button
                key={label}
                onClick={() =>
                  router.push(`/setting/notification-and-sound/${route}`)
                }
                className="flex w-full items-stretch px-0 focus:outline-none"
                style={{ minHeight: 0 }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center pl-4 pr-3">
                  <div className="w-9 h-9 flex items-center justify-center">
                    {icon}
                  </div>
                </div>
                {/* Phần chữ + border-b */}
                <div
                  className={`flex-1 min-w-0 py-[12px] min-h-[60px] ${idx !== messageItems.length - 1
                      ? "border-b border-[#E5E5EA] dark:border-[#2c2c2e]"
                      : ""
                    }`}
                >
                  <div className="flex items-center">
                    {/* Label + description */}
                    {description ? (
                      <div className="flex flex-col items-start justify-start flex-1">
                        <span className="text-[16px] font-medium text-black dark:text-white leading-[20px]">
                          {label}
                        </span>
                        <span className="text-[13px] text-[#8e8e93] dark:text-[#8e8e93] leading-[17px] mt-[2px]">
                          {description}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center h-9 flex-1">
                        <span className="text-[16px] font-medium text-black dark:text-white leading-[20px]">
                          {label}
                        </span>
                      </div>
                    )}
                    {/* Trạng thái + > */}
                    <div className="flex items-center space-x-1 pl-2 pr-[10px]">
                      <span className="text-[15px] text-[#8e8e93] dark:text-[#8e8e93] leading-[20px]">
                        {customText ?? (value ? "On" : "Off")}
                      </span>
                      <span className="text-[17px] text-[#c7c7cc] dark:text-[#48484a] leading-[20px]">
                        &gt;
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      </Section>

      {/* In-App Notifications */}
      <Section title="IN-APP NOTIFICATIONS">
        <Card>
          <NotificationToggle
            label="In-App Sounds"
            enabled={inAppSounds}
            setEnabled={setInAppSounds}
          />
          <NotificationToggle
            label="In-App Vibrate"
            enabled={inAppVibrate}
            setEnabled={setInAppVibrate}
          />
          <NotificationToggle
            label="In-App Preview"
            enabled={inAppPreview}
            setEnabled={setInAppPreview}
          />
        </Card>
      </Section>

      {/* Lock Screen */}
      <Card>
        <NotificationToggle
          label="Names on Lock Screen"
          enabled={lockScreenNames}
          setEnabled={setLockScreenNames}
        />
      </Card>
      <Description>
        Display names in notifications when the device is locked. To disable,
        make sure that 'Show Previews' is also set to 'When Unlocked' or 'Never'
        in{" "}
        <span className="text-blue-400">iOS Settings &gt; Notifications.</span>
      </Description>

      {/* Badge Counter */}
      <Section title="Badge Counter">
        <Card>
          <NotificationToggle
            label="Include Channels"
            enabled={includeChannels}
            setEnabled={setIncludeChannels}
          />
          <NotificationToggle
            label="Count Unread Messages"
            enabled={countUnread}
            setEnabled={setCountUnread}
          />
        </Card>
        <Description>
          Switch off to show the number of unread chats instead of messages
        </Description>
      </Section>

      {/* New Contacts */}
      <Card>
        <NotificationToggle
          label="New Contacts"
          enabled={newContacts}
          setEnabled={setNewContacts}
        />
      </Card>
      <Description>
        Receive push notifications when one of your contacts becomes available
        on Telegram.
      </Description>

      {/* Reset Button */}
      <div className="pt-0">
        <Card>
          <button
            type="button"
            className="text-red-500 font-semibold w-full py-2 rounded-xl transition text-left pl-2 bg-transparent"
          >
            Reset All Notifications
          </button>
        </Card>
        <Description>
          Undo all custom notification settings for your contacts, groups and
          channels.
        </Description>
      </div>

      <div className="h-8" />
    </div>
  );
}

// Section title
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <>
    <p className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-sm px-1 mb-1 mt-4">
      {title}
    </p>
    {children}
  </>
);

// White card container
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 py-2 bg-white dark:bg-[#1c1c1e] border border-[#d1d1d6] dark:border-[#2c2c2e] rounded-xl divide-y space-y-1">
    {children}
  </div>
);

// Text under cards
const Description = ({ children }: { children: React.ReactNode }) => (
  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 px-1">
    {children}
  </p>
);
