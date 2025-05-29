"use client";

import {
  User,
  Users,
  Megaphone,
  LoaderCircle,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { JSX, useState } from "react";

type AutoRemoveLabel = "Private Chats" | "Group Chats" | "Channels" | "Stories";

const autoRemoveOptions: Record<AutoRemoveLabel, string[]> = {
  "Private Chats": ["Never", "1 day", "1 week", "Add Exception"],
  "Group Chats": ["Never", "3 days", "1 week", "1 month", "Add Exception"],
  Channels: ["Never", "1 week", "2 weeks", "Add Exception"],
  Stories: ["Never", "6 hours", "1 day", "2 days"],
};

const iconMap: Record<AutoRemoveLabel, JSX.Element> = {
  "Private Chats": <User size={20} />,
  "Group Chats": <Users size={20} />,
  Channels: <Megaphone size={20} />,
  Stories: <LoaderCircle size={20} />,
};

export default function AutoRemoveSettings() {
  const [selected, setSelected] = useState<Record<AutoRemoveLabel, string>>({
    "Private Chats": "Never",
    "Group Chats": "1 month",
    Channels: "1 week",
    Stories: "2 days",
  });

  const [openDropdown, setOpenDropdown] = useState<AutoRemoveLabel | null>(
    null
  );

  const handleSelect = (label: AutoRemoveLabel, value: string) => {
    setSelected((prev) => ({ ...prev, [label]: value }));
    setOpenDropdown(null);
  };

  return (
    <div className="relative z-10">
      {/* Dim background overlay */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      <div className="rounded-xl bg-zinc-900 mb-4 relative z-40">
        <h2 className="text-sm text-zinc-400 px-4 pt-3">
          AUTO-REMOVE CACHED MEDIA
        </h2>

        {(Object.keys(selected) as AutoRemoveLabel[]).map((label) => (
          <div key={label} className="relative">
            <button
              onClick={() =>
                setOpenDropdown((prev) => (prev === label ? null : label))
              }
              className="flex justify-between items-center w-full px-4 py-3 hover:bg-zinc-800"
            >
              <div className="flex items-center space-x-3">
                <span>{iconMap[label]}</span>
                <span>{label}</span>
              </div>

              {/* Gộp phần chữ selected[label] và icon vào 1 nút nhấn */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown((prev) => (prev === label ? null : label));
                }}
                className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-zinc-700 cursor-pointer"
              >
                <span className="text-sm text-zinc-300">{selected[label]}</span>
                <ChevronsUpDown size={20} className="text-zinc-400" />
              </div>
            </button>

            {/* Dropdown absolute below right side */}
            {openDropdown === label && (
              <div className="absolute right-4 top-full mt-1 w-56 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-50">
                {autoRemoveOptions[label].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(label, option)}
                    className={`w-full px-4 py-2 text-left text-sm flex justify-between items-center hover:bg-zinc-700 ${
                      selected[label] === option
                        ? "text-blue-400 font-semibold"
                        : "text-white"
                    }`}
                  >
                    <span>{option}</span>
                    {selected[label] === option && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
