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

    const [user, setUser] = React.useState<sdk.User | undefined>(undefined);
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

    // Fetch user info & avatar
    React.useEffect(() => {
        if (!roomId || !client) return;

        getUserInfoInPrivateRoom(roomId, client)
            .then((res) => {
                if (res.success && res.user) {
                    setUser(res.user);

                    // Kiểm tra avatarUrl tồn tại
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
                    onClick={() => router.back()}
                    variant="ghost"
                    className="text-blue-500 font-semibold"
                >
                    Done
                </Button>
            </div>

            {/* Avatar + Name Section */}
            <div className="container mx-auto px-4">
                <div className="flex gap-4 p-4 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md w-full items-start mb-4 shadow-sm">
                    {/* Avatar */}
                    <img
                        src={avatarUrl ?? "/avatar.png"}
                        alt="Avatar"
                        className="w-14 h-14 rounded-full bg-gray-300 object-cover shrink-0"
                    />

                    {/* Name + input */}
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-black">
                            {user?.displayName ?? "Unknown User"}
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
                                className="flex-1 min-w-0 border-none bg-transparent outline-none italic text-dark-500 placeholder:italic"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Sections */}
                <div className="rounded-2xl border border-white/30 bg-white/20 backdrop-blur-md overflow-hidden mb-4 shadow-sm">
                    {/* Suggest Photo */}
                    <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-100">
                        <div>
                            <p className="font-medium">
                                Suggest photo for {user?.displayName ?? "user"}
                            </p>
                            <p className="text-sm text-gray-500">
                                You can replace {user?.displayName ?? "this user"}'s photo with
                                another photo that only you can see.
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>

                    <div className="h-px bg-gray-200 mx-4" />

                    {/* Set Photo */}
                    <div className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-100">
                        <div>
                            <p className="font-medium">
                                Set photo for {user?.displayName ?? "user"}
                            </p>
                            <p className="text-sm text-gray-500">
                                You can replace {user?.displayName ?? "this user"}'s photo with
                                another photo that only you can see.
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                {/* Remove Contact */}
                <div className="mt-6 p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-md shadow-sm cursor-pointer hover:bg-white/30 flex items-start justify-between">
                    <div>
                        <p className="text-red-600 font-medium">Remove contact</p>
                        <p className="text-sm text-gray-500 mt-1">
                            This will remove the contact from your list.
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                </div>
            </div>
        </div>
    );
}
