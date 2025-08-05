"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import * as sdk from "matrix-js-sdk";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { getUserInfoInPrivateRoom } from "@/services/chatService";

export default function ContactEditPage() {
    const router = useRouter();
    const client = useMatrixClient();
    const params = useParams();
    const roomId = decodeURIComponent(params.id as string);
    const [inputName, setInputName] = React.useState("");
    const [lastName, setLastName] = React.useState("");
    const CUSTOM_NAME_EVENT = "dev.custom_name";
    const CUSTOM_AVATAR_EVENT = "dev.custom_avatar";
    const [customAvatarUrl, setCustomAvatarUrl] = React.useState<string | null>(null);
    const [selectedAvatarFile, setSelectedAvatarFile] = React.useState<File | null>(null);
    

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputName(e.target.value);
    };


    const handleSaveCustomName = async () => {
        if (!user?.userId || !client) return;

        try {
            const event = client.getAccountData(CUSTOM_NAME_EVENT as any);
            const existingData = event?.getContent<Record<string, string>>() || {};

            const updatedData: Record<string, string> = {
                ...existingData,
                [user.userId]: inputName,
            };


            await client.setAccountData(CUSTOM_NAME_EVENT as any, updatedData as any);


            await new Promise((resolve) => setTimeout(resolve, 300));


            const confirmedEvent = client.getAccountData(CUSTOM_NAME_EVENT as any);
            const confirmedData = confirmedEvent?.getContent<Record<string, string>>();
            const confirmedName = confirmedData?.[user.userId];

            if (confirmedName === inputName) {
                setLastName(confirmedName);
                router.replace(`/chat/${roomId}/info`);
            } else {
                console.warn("The name hasn't been synced yet. Please try again later.");
            }
        } catch (error) {
            console.error("Failed to save custom name:", error);
        }
    };

    const handleSaveCustomAvatar = async () => {
        if (!client || !user?.userId || !selectedAvatarFile) return;

        try {
            const res = await client.uploadContent(selectedAvatarFile, {
                name: selectedAvatarFile.name,
                type: selectedAvatarFile.type,
            });

            const mxcUrl = typeof res === "string" ? res : res?.content_uri;

            if (mxcUrl) {
                const event = client.getAccountData(CUSTOM_AVATAR_EVENT as any);
                const existingData = event?.getContent<Record<string, string>>() || {};

                const updatedData = {
                    ...existingData,
                    [user.userId]: mxcUrl,
                };

                await client.setAccountData(CUSTOM_AVATAR_EVENT as any, updatedData as any);
            }
        } catch (error) {
            console.error("Failed to save custom avatar:", error);
        }
    };
    const handleDone = async () => {
        await Promise.all([
            handleSaveCustomAvatar(),
            handleSaveCustomName()
        ]);
        router.replace(`/chat/${roomId}/info`);
    };
    const [user, setUser] = React.useState<sdk.User | undefined>(undefined);
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
    const handleRemoveContact = async () => {
        if (!client || !roomId) return;

        try {
            await client.leave(roomId);
            await client.forget(roomId);
            router.push("/chat");
        } catch (err) {
            console.error("Failed to remove contact:", err);
        }
    };



    React.useEffect(() => {
        if (!roomId || !client) return;

        getUserInfoInPrivateRoom(roomId, client)
            .then((res) => {
                if (res.success && res.user) {
                    setUser(res.user);

                    const avatar = (res.user as any).avatarUrl;
                    if (avatar) {
                        const httpUrl = client.mxcUrlToHttp(avatar, 400, 400, "scale", true);
                        setAvatarUrl(httpUrl);
                    }
                } else {
                    console.error("Error:", res.err);
                }
            })
            .catch((res) => {
                console.error("Error:", res.err);
            });
    }, [roomId, client]);

    React.useEffect(() => {
        if (!client || !user?.userId) return;

        const fetchCustomName = async () => {
            try {
                const event = await client.getAccountData(CUSTOM_NAME_EVENT as any);
                const data = event?.getContent<Record<string, string>>();
                const custom = data?.[user.userId];
                setLastName(custom ?? "");
            } catch (error) {
                console.error("Failed to fetch custom name:", error);
            }
        };

        fetchCustomName();
    }, [client, user]);

    

    React.useEffect(() => {
        if (!client || !user?.userId) return;

        const fetchAvatar = async () => {
            try {
                const event = await client.getAccountData(CUSTOM_AVATAR_EVENT as any);
                const data = event?.getContent<Record<string, string>>();
                const mxcUrl = data?.[user.userId];
                if (mxcUrl) {
                    const url = client.mxcUrlToHttp(mxcUrl, 400, 400, "scale", true);
                    setCustomAvatarUrl(url);
                }
            } catch (error) {
                console.error("Failed to load custom avatar:", error);
            }
        };

        fetchAvatar();
    }, [client, user]);


    const displayName = lastName || user?.displayName || "user";
    return (
        <div className="w-full mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md flex items-center justify-center shadow-sm"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                    >
                        <path
                            d="M11 2L5 8L11 14"
                            strokeWidth="2"
                            stroke="black"
                            fill="none"
                        />
                    </svg>
                </button>

                <h1 className="text-lg font-semibold">Edit</h1>
                <Button
                    onClick={handleDone}
                    variant="ghost"
                    className="text-blue-500 font-semibold"
                >
                    Done
                </Button>
            </div>

            {/* Avatar + Name Section */}
            <div className="container mx-auto px-4">
                <input
                    type="file"
                    accept="image/*"
                    id="avatar-upload"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            setSelectedAvatarFile(file);
                            const localUrl = URL.createObjectURL(file);
                            setCustomAvatarUrl(localUrl);
                        }
                    }}
                />

                <div className="flex gap-4 p-4 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md w-full items-start mb-4 shadow-sm">
                    {/* Avatar */}
                    <img
                        src={customAvatarUrl ?? avatarUrl ?? "/avatar.png"}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full bg-gray-300 object-cover shrink-0"
                    />


                    {/* Name + input */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-black">
                            {lastName || user?.displayName || "Unknown User"}
                        </p>

                        <div className="overflow-hidden w-full my-1">
                            <div className="h-px w-full bg-white/30" />
                        </div>
                        {/* Last name input */}
                        <div className="flex items-center gap-2 mt-1 w-full min-w-0">
                            <span className="italic text-gray-500 whitespace-nowrap">
                                Last name
                            </span>
                            <input
                                placeholder=""
                                value={inputName}
                                onChange={handleInputChange}
                                className="flex-1 min-w-0 border-none bg-transparent outline-none italic text-dark-500 placeholder:italic"
                            />

                        </div>
                    </div>
                </div>

                {/* Action Sections */}
                <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md overflow-hidden mb-4 shadow-sm">
                    {/* Suggest Photo */}
                    <div onClick={() => {
                        document.getElementById("avatar-upload")?.click();
                    }}

                        className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-100">
                        <div>
                            <p className="font-medium">
                                Suggest photo for {displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                                You can replace {displayName}'s photo with
                                another photo that only you can see.
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 self-center flex-shrink-0" />

                    </div>

                    <div className="h-px bg-gray-200 mx-4" />

                    {/* Set Photo */}
                    <div onClick={() => {
                        document.getElementById("avatar-upload")?.click();
                    }}

                        className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-100">
                        <div>
                            <p className="font-medium">
                                Set photo for {displayName}
                            </p>
                            <p className="text-sm text-gray-500">
                                You can replace {displayName}'s photo with
                                another photo that only you can see.
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 self-center flex-shrink-0" />

                    </div>
                </div>

                {/* Remove Contact */}
                <div
                    onClick={handleRemoveContact}
                    className="mt-6 p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md shadow-sm cursor-pointer hover:bg-white/30 flex items-start justify-between"
                >

                    <div>
                        <p className="text-red-600 font-medium">Remove contact</p>
                        <p className="text-sm text-gray-500 mt-1">
                            This will remove the contact from your list.
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 self-center flex-shrink-0" />

                </div>
            </div>
        </div>
    );
}
