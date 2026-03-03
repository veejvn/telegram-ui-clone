import { MatrixClient } from "matrix-js-sdk";
import { useChatStore, MessageType } from "@/stores/useChatStore";
import {
    getImageDimensions,
    sendFileMessage,
    sendImageMessage,
    sendLocationMessage,
    sendSticker,
    sendVideoMessage,
} from "@/services/chatService";
import { getVideoMetadata, Metadata } from "@/utils/chat/send-message/getVideoMetadata";
import { FileInfo, ImageInfo } from "@/types/chat";
import React from "react";

interface UseSendHandlersProps {
    roomId: string;
    client: MatrixClient | null;
    setOpen: (open: boolean) => void;
    setShowStickers: (show: boolean) => void;
}

export const useSendHandlers = ({ roomId, client, setOpen, setShowStickers }: UseSendHandlersProps) => {
    const addMessage = useChatStore((state) => state.addMessage);
    const updateMessage = useChatStore((state) => state.updateMessage);

    const handleImagesAndVideos = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = e.target.files;
        if (!files || !client) return;
        setOpen(false);
        const userId = client.getUserId();
        const now = new Date();

        for (const file of Array.from(files)) {
            try {
                const localId = "local_" + Date.now() + Math.random();
                if (file.type.startsWith("image/")) {
                    const dimentions = await getImageDimensions(file);
                    const imageInfo: ImageInfo = {
                        width: dimentions.width,
                        height: dimentions.height,
                    };

                    addMessage(roomId, {
                        eventId: localId,
                        sender: userId ?? undefined,
                        senderDisplayName: userId ?? undefined,
                        text: file.name,
                        imageUrl: null,
                        imageInfo,
                        time: now.toLocaleString(),
                        timestamp: now.getTime(),
                        status: "sent",
                        type: "image",
                    });

                    const { httpUrl } = await sendImageMessage(client, roomId, file);
                    updateMessage(roomId, localId, { imageUrl: httpUrl });
                } else if (file.type.startsWith("video/")) {
                    const metadata = await getVideoMetadata(file);
                    const videoInfo: Metadata = {
                        width: metadata.width,
                        height: metadata.height,
                        duration: metadata.duration,
                    };
                    addMessage(roomId, {
                        eventId: localId,
                        sender: userId ?? undefined,
                        senderDisplayName: userId ?? undefined,
                        text: file.name,
                        videoUrl: null,
                        videoInfo,
                        time: now.toLocaleString(),
                        timestamp: now.getTime(),
                        status: "sent",
                        type: "video",
                    });

                    const { httpUrl } = await sendVideoMessage(client, roomId, file);
                    updateMessage(roomId, localId, {
                        videoUrl: httpUrl,
                    });
                }
            } catch (err) {
                console.error("Failed to send image/video:", err);
            }
        }
        e.target.value = ""; // reset input
    };

    const handleSendLocation = async (location: {
        latitude: number;
        longitude: number;
        accuracy: number;
    }) => {
        if (!client) return;
        const userId = client.getUserId();
        try {
            setOpen(false);
            const localId = "local_" + Date.now();
            const now = new Date();
            const { latitude, longitude, accuracy } = location;
            const geoUri = `geo:${latitude},${longitude};u=${accuracy}`;
            const displayText = `📍 My location (accurate to ${Math.round(
                accuracy
            )}m)`;

            addMessage(roomId, {
                eventId: localId,
                sender: userId ?? undefined,
                senderDisplayName: userId ?? undefined,
                text: displayText,
                location: {
                    latitude,
                    longitude,
                    description: displayText ?? undefined,
                },
                time: now.toLocaleString(),
                timestamp: now.getTime(),
                status: "sent",
                type: "location",
            });

            const res = await sendLocationMessage(client, roomId, {
                geoUri,
                displayText,
            });

            if (res.success) {
                console.log("Send Location Message successfully");
            }
        } catch (error) {
            console.error("Failed to send location:", error);
        }
    };

    const handleSendFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !client) return;
        setOpen(false);
        const userId = client.getUserId();
        for (const file of Array.from(files)) {
            try {
                let httpUrlImage: string | null = null;
                let httpUrlVideo: string | null = null;
                let metadata: Metadata | null = null;
                let httpUrlFile: string | null = null;
                let fileInfo: FileInfo | null = null;
                const contentType = file.type;
                let type: MessageType = "file";
                const localId = "local_" + Date.now() + Math.random();
                const now = new Date();

                if (contentType.startsWith("image/")) {
                    type = "image";
                    addMessage(roomId, {
                        eventId: localId,
                        sender: userId ?? undefined,
                        senderDisplayName: userId ?? undefined,
                        text: file.name,
                        imageUrl: httpUrlImage,
                        time: now.toLocaleString(),
                        timestamp: now.getTime(),
                        status: "sent",
                        type: type,
                    });
                    const res = await sendImageMessage(client, roomId, file);
                    httpUrlImage = res.httpUrl;
                    updateMessage(roomId, localId, { imageUrl: httpUrlImage });
                } else if (contentType.startsWith("video/")) {
                    type = "video";
                    addMessage(roomId, {
                        eventId: localId,
                        sender: userId ?? undefined,
                        senderDisplayName: userId ?? undefined,
                        text: file.name,
                        videoUrl: httpUrlVideo,
                        videoInfo: metadata,
                        time: now.toLocaleString(),
                        timestamp: now.getTime(),
                        status: "sent",
                        type: type,
                    });
                    const res = await sendVideoMessage(client, roomId, file);
                    httpUrlVideo = res.httpUrl;
                    metadata = res.metadata;
                    updateMessage(roomId, localId, {
                        videoUrl: httpUrlVideo,
                        videoInfo: metadata,
                    });
                } else {
                    addMessage(roomId, {
                        eventId: localId,
                        sender: userId ?? undefined,
                        senderDisplayName: userId ?? undefined,
                        text: file.name,
                        fileUrl: httpUrlFile,
                        fileInfo: fileInfo,
                        time: now.toLocaleString(),
                        timestamp: now.getTime(),
                        status: "sent",
                        type: type,
                    });
                    const res = await sendFileMessage(client, roomId, file);
                    httpUrlFile = res.httpUrl;
                    fileInfo = { fileSize: file.size, mimeType: file.type };
                    updateMessage(roomId, localId, {
                        fileUrl: httpUrlFile,
                        fileInfo: fileInfo,
                    });
                }
            } catch (error) {
                console.error("Failed to send file:", error);
            }
        }
    };

    const handleStickerSelect = async (
        emoji: string,
        isStickerAnimation: boolean
    ) => {
        setShowStickers(false);
        if (!client) return;
        try {
            const localId = "local_" + Date.now();
            const userId = client.getUserId();
            const now = new Date();
            addMessage(roomId, {
                eventId: localId,
                sender: userId ?? undefined,
                senderDisplayName: userId ?? undefined,
                text: emoji,
                isStickerAnimation: isStickerAnimation,
                time: now.toLocaleString(),
                timestamp: now.getTime(),
                status: "sent",
                type: "sticker",
            });
            await sendSticker(client, roomId, emoji, isStickerAnimation);
        } catch (error) {
            console.error("Failed to send sticker:", error);
        }
    };

    return {
        handleImagesAndVideos,
        handleSendLocation,
        handleSendFile,
        handleStickerSelect,
    };
};
