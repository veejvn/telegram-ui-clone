import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GrGallery } from "react-icons/gr";
import { IoFolderOutline } from "react-icons/io5";
import { CiLocationOn } from "react-icons/ci";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const LocationMap = dynamic(() => import("@/components/common/LocationMap"), {
    ssr: false,
});

interface AttachmentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    tab: "Photo" | "File" | "Location";
    setTab: (tab: "Photo" | "File" | "Location") => void;
    setSelectOpen: (open: boolean) => void;
    sheetRef: React.RefObject<HTMLDivElement | null>;
    imageInputRef: React.RefObject<HTMLInputElement | null>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onImagesAndVideosChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSendLocation: (location: { latitude: number; longitude: number; accuracy: number }) => void;
}

const AttachmentSheet: React.FC<AttachmentSheetProps> = ({
    isOpen,
    onClose,
    tab,
    setTab,
    setSelectOpen,
    sheetRef,
    imageInputRef,
    fileInputRef,
    onImagesAndVideosChange,
    onSendFileChange,
    onSendLocation,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF4D] dark:bg-[#FFFFFF4D] backdrop-blur-[48px] rounded-t-[36px] shadow-2xl"
                    ref={sheetRef as React.RefObject<HTMLDivElement>}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between w-full p-2 px-4 font-medium text-gray-600 capitalize">
                        <div onClick={(e) => e.stopPropagation()}>
                            <Select
                                value={tab.toLowerCase()}
                                onValueChange={(value) => {
                                    if (value === "photo") setTab("Photo");
                                    else if (value === "file") setTab("File");
                                    else if (value === "location") setTab("Location");
                                }}
                                onOpenChange={setSelectOpen}
                            >
                                <SelectTrigger
                                    className="text-xs rounded-4xl bg-[#FFFFFF4D] border-none text-blue-500"
                                    data-radix-select-trigger
                                >
                                    <SelectValue>{tab}</SelectValue>
                                </SelectTrigger>
                                <SelectContent
                                    className="w-[180px] rounded-3xl divide- [&_[data-radix-select-item-indicator]]:!hidden [&_span[data-radix-select-item-indicator]]:!hidden"
                                    data-radix-select-content
                                >
                                    <SelectItem
                                        value="photo"
                                        className="flex items-center justify-between w-full cursor-pointer text-[12px]"
                                        style={{
                                            color: tab === "Photo" ? "#3b82f6" : "#374151",
                                            backgroundColor:
                                                tab === "Photo" ? "#eff6ff" : "transparent",
                                            fontWeight: tab === "Photo" ? "500" : "400",
                                        }}
                                    >
                                        <span className="flex-1">Photo</span>
                                        <GrGallery
                                            style={{
                                                color: tab === "Photo" ? "#3b82f6" : "#374151",
                                                flexShrink: 0,
                                            }}
                                        />
                                    </SelectItem>
                                    <SelectItem
                                        value="file"
                                        className="flex items-center justify-between w-full cursor-pointer text-[12px] [&_span[data-radix-select-item-indicator]]:!hidden"
                                        style={{
                                            color: tab === "File" ? "#3b82f6" : "#374151",
                                            backgroundColor:
                                                tab === "File" ? "#eff6ff" : "transparent",
                                            fontWeight: tab === "File" ? "500" : "400",
                                        }}
                                    >
                                        File
                                        <IoFolderOutline
                                            className={`w-5 h-5 mb-1 ${tab === "File" ? "text-blue-500" : ""
                                                }`}
                                        />
                                    </SelectItem>
                                    <SelectItem
                                        value="location"
                                        className="flex items-center justify-between w-full cursor-pointer text-[12px] [&_span[data-radix-select-item-indicator]]:!hidden"
                                        style={{
                                            color: tab === "Location" ? "#3b82f6" : "#374151",
                                            backgroundColor:
                                                tab === "Location" ? "#eff6ff" : "transparent",
                                            fontWeight: tab === "Location" ? "500" : "400",
                                        }}
                                    >
                                        Location
                                        <CiLocationOn
                                            className={`w-5 h-5 mb-1 ${tab === "Location" ? "text-blue-500" : ""
                                                }`}
                                        />
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant={"link"}
                            className="size-8 bg-[#8080804D] rounded-full"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5 text-white" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="p-2 h-[500px]">
                        {tab === "Photo" && (
                            <div className="flex justify-center items-center h-full">
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="p-2 bg-blue-500 text-white rounded-md"
                                >
                                    Chọn ảnh hoặc video
                                </button>
                                <input
                                    ref={imageInputRef as React.RefObject<HTMLInputElement>}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={onImagesAndVideosChange}
                                    className="hidden"
                                    aria-label="file"
                                />
                            </div>
                        )}
                        {tab === "File" && (
                            <div className="flex justify-center items-center h-full">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 bg-blue-500 text-white rounded-md"
                                >
                                    Chọn file
                                </button>
                                <input
                                    ref={fileInputRef as React.RefObject<HTMLInputElement>}
                                    type="file"
                                    onChange={onSendFileChange}
                                    multiple
                                    className="hidden"
                                    aria-label="file"
                                />
                            </div>
                        )}
                        {tab === "Location" && (
                            <div className="h-full overflow-y-auto">
                                <div className="mb-4">
                                    <div className="rounded-2xl overflow-hidden relative">
                                        <LocationMap onSend={onSendLocation} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AttachmentSheet;
