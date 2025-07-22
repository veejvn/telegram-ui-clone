"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactService from "@/services/contactService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";
import useCallStore from "@/stores/useCallStore"; // Thêm import này phía trên
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";

interface Contact {
    id: string;
    name: string;
    lastSeen: string;
    roomId: string;
}

export default function NewCallPage() {
    const client = useMatrixClient();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const headerStyle = getHeaderStyleWithStatusBar();

    useEffect(() => {
        if (!client) return;
        const matrixClient = client;

        async function loadContacts() {
            const rooms = await ContactService.getDirectMessageRooms(matrixClient);
            const list = rooms.map((room) => {
                const other = room
                    .getJoinedMembers()
                    .find((m) => m.userId !== matrixClient.getUserId());
                return {
                    id: other?.userId || "",
                    name: other?.name || other?.userId || "",
                    lastSeen: "recently",
                    roomId: room.roomId,
                };
            });
            setContacts(list);
        }

        loadContacts();
    }, [client]);

    const handleStartCall = async (c: Contact) => {
        // 🟢 Reset call state trước khi gọi
        useCallStore.getState().reset();
        router.push(
            `/call/voice?calleeId=${encodeURIComponent(c.roomId)}&contact=${encodeURIComponent(c.name)}`
        );
    };

    const filtered = contacts
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .filter((c) => c.id !== "@bot:matrix.teknix.dev")
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex h-screen flex-col dark:bg-black dark:text-white">
            <header
                style={headerStyle}
                className="sticky top-0 z-10 bg-white dark:bg-black border-b border-zinc-700"
            >
                <div className="px-4 pt-4 pb-2 flex items-center justify-between">                <button className="text-blue-400 text-sm" onClick={() => router.back()}>
                    Close
                </button>
                    <h1 className="text-sm font-semibold">New Call</h1>
                    <div className="w-12" />
                </div>
            </header>
            <main className="pt-[env(safe-area-inset-top)] flex-1 flex flex-col">
                <div className="px-4 pb-2">
                    <Input
                        className="rounded-md dark:bg-zinc-900 border-zinc-700 text-sm placeholder:text-zinc-500"
                        placeholder="Search for contacts or usernames"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 relative">
                    <ScrollArea className="h-full pr-4">
                        {filtered.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-zinc-500">
                                Không có contact phù hợp.
                            </div>
                        ) : (
                            filtered.map((c) => (
                                <div
                                    key={c.id}
                                    className="px-4 py-2 flex items-center gap-3 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
                                    onClick={() => setSelectedContact(c)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{c.name}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollArea>
                    {selectedContact && (
                        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                            <div className="bg-white rounded-xl p-6 flex flex-col gap-4 w-80">
                                <h2 className="font-bold text-lg text-center text-black">Chọn loại cuộc gọi</h2>
                                <button
                                    className="p-3 rounded bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2"
                                    onClick={() => {
                                        useCallStore.getState().reset();
                                        router.push(`/call/voice?calleeId=${encodeURIComponent(selectedContact.roomId)}&contact=${encodeURIComponent(selectedContact.name)}`);
                                        setSelectedContact(null);
                                    }}
                                >
                                    <span className="text-blue-500 font-semibold">Gọi thoại</span>
                                </button>
                                <button
                                    className="p-3 rounded bg-green-100 hover:bg-green-200 flex items-center justify-center gap-2"
                                    onClick={() => {
                                        useCallStore.getState().reset();
                                        router.push(`/call/video?calleeId=${encodeURIComponent(selectedContact.roomId)}&contact=${encodeURIComponent(selectedContact.name)}`);
                                        setSelectedContact(null);
                                    }}
                                >
                                    <span className="text-green-500 font-semibold">Gọi video</span>
                                </button>
                                <button
                                    className="text-gray-500 hover:underline text-sm mt-2"
                                    onClick={() => setSelectedContact(null)}
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div >
    );
}
