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
          className={`w-11 h-6 rounded-full transition-colors duration-300 ${
            enabled ? "bg-green-500" : isDark ? "bg-[#3a3a3c]" : "bg-[#d1d1d6]"
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
          src="/icons/private-chat.png"
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
          src="/icons/group-chat.png"
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
          src="/icons/channel.png"
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
          src="/icons/story.png"
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
          src="/icons/reaction.png"
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
        <div className="overflow-hidden bg-white dark:bg-[#1c1c1e] rounded-xl border border-[#d1d1d6] dark:border-[#2c2c2e] divide-y">
          {messageItems.map(
            ({
              label,
              icon,
              iconBg,
              value,
              route,
              customText,
              description,
            }) => (
              <button
                key={label}
                onClick={() =>
                  router.push(`/setting/notification-and-sound/${route}`)
                }
                className="flex items-center justify-between w-full px-4 py-3 focus:outline-none"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-9 h-9 flex items-center justify-center">
                    {icon}
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-black dark:text-white">
                      {label}
                    </span>
                    {description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {customText ?? (value ? "On" : "Off")}
                  </span>
                  <span className="text-lg text-gray-400 dark:text-gray-500">
                    {">"}
                  </span>
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
