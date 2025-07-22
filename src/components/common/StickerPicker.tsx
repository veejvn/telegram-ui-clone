// app/components/StickerPicker.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import { Theme as EmojiTheme } from "emoji-picker-react";
import { getLS, setLS } from "@/tools/localStorage.tool";

//const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false }); // Lazy load nếu có

const STICKER_PACKS = [
  { name: "teknixCT", path: "/chat/stickers/TeknixCT", count: 95 },
  { name: "TomAndJerry", path: "/chat/stickers/TomAndJerry", count: 48 },
  { name: "Panpa", path: "/chat/stickers/Panpa", count: 120 },
  {
    name: "VideoMeme",
    path: "/chat/stickers/VideoMeme",
    count: 50,
    useVideo: true,
  },
  { name: "Cats", path: "/chat/stickers/Cats", count: 33 },
  { name: "Nekonyaaaa", path: "/chat/stickers/Nekonyaaaa", count: 119 },
  { name: "PEPEtop", path: "/chat/stickers/PEPEtop", count: 118 },
];

type StickerPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onStickerSelect: (url: any, isVideo: boolean) => void;
  onEmojiSelect: (emoji: any) => void;
};

export default function StickerPicker({
  isOpen,
  onClose,
  onStickerSelect,
  onEmojiSelect,
}: StickerPickerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activePack, setActivePack] = useState(STICKER_PACKS[0].name);
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("stickers");

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const currentStickers = STICKER_PACKS.find((p) => p.name === activePack);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLS("stickerPickerTab", value);
  };

  useEffect(() => {
    const savedTab = getLS("stickerPickerTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          onMouseDown={handleOverlayMouseDown}
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-zinc-800 w-full max-w-md rounded-t-2xl p-4 pb-12 h-[464px]"
            initial={{ y: 400 }}
            animate={{ y: 0 }}
            exit={{ y: 400 }}
            transition={{ type: "spring", bounce: 0.3 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 mb-3">
                <TabsTrigger value="stickers">Stickers</TabsTrigger>
                <TabsTrigger value="emoji">Emoji</TabsTrigger>
              </TabsList>

              <TabsContent value="stickers">
                {/* Sticker Pack Navigation */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {STICKER_PACKS.map((pack) => (
                    <button
                      key={pack.name}
                      onClick={() => setActivePack(pack.name)}
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                        activePack === pack.name
                          ? "border-zinc-500"
                          : "border-transparent"
                      }`}
                      aria-label="select"
                    >
                      {pack.useVideo ? (
                        <video
                          src={`${pack.path}/0.webp`}
                          autoPlay
                          loop
                          muted
                          playsInline
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Image
                          src={`${pack.path}/0.webp`}
                          alt={pack.name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Sticker Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto">
                  {currentStickers &&
                    Array.from({ length: currentStickers.count }).map(
                      (_, idx) => {
                        const src = `${currentStickers.path}/${idx}.webp`;
                        const isVideo: boolean =
                          currentStickers.useVideo ?? false;
                        return (
                          <button
                            key={idx}
                            onClick={() => onStickerSelect(src, isVideo)}
                            className="hover:scale-110 transition"
                            aria-label="select"
                          >
                            <div className="w-full h-full aspect-square overflow-hidden rounded">
                              {isVideo ? (
                                <video
                                  src={src}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image
                                  src={src}
                                  alt={`sticker-${idx}`}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              )}
                            </div>
                          </button>
                        );
                      }
                    )}
                </div>
              </TabsContent>

              <TabsContent value="emoji">
                <div className="max-h-72">
                  {activeTab === "emoji" && (
                    <EmojiPicker
                      width={350}
                      height={350}
                      onEmojiClick={onEmojiSelect}
                      lazyLoadEmojis={true}
                      searchDisabled={true}
                      previewConfig={{ showPreview: false }}
                      theme={
                        theme.theme === "dark"
                          ? EmojiTheme.DARK
                          : EmojiTheme.LIGHT
                      }
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
