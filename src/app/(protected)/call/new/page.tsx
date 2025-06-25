"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContactService from "@/services/contactService";
import { callService } from "@/services/callService";
import { useMatrixClient } from "@/contexts/MatrixClientProvider";
import { useRouter } from "next/navigation";

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
    const [isCalling, setIsCalling] = useState(false);
    const router = useRouter();

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
        if (!client) return;

        setIsCalling(true);
        try {
            await callService.placeCall(c.roomId, 'voice');

            callService.once('connected', () => {
                router.push(
                    `/call/voice?calleeId=${encodeURIComponent(c.id)}&contact=${encodeURIComponent(c.name)}`
                );
            });

            callService.once('call-error', (err: Error) => {
                console.error('Lỗi khi thực hiện cuộc gọi:', err);
                setIsCalling(false);
            });

            callService.once('call-ended', () => {
                setIsCalling(false);
            });

        } catch (err) {
            console.error('Lỗi khi thực hiện cuộc gọi:', err);
            setIsCalling(false);
        }
    };

    const filtered = contacts
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="flex h-screen flex-col bg-black text-white">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <button className="text-blue-400 text-sm" onClick={() => router.back()}>
                    Close
                </button>
                <h1 className="text-sm font-semibold">New Call</h1>
                <div className="w-12" />
            </div>

            <div className="px-4 pb-2">
                <Input
                    className="rounded-md bg-zinc-900 border-zinc-700 text-sm placeholder:text-zinc-500"
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
                                className="px-4 py-2 flex items-center gap-3 hover:bg-zinc-900 cursor-pointer"
                                onClick={() => handleStartCall(c)}
                            >
                                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{c.name}</div>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
            </div>

            {isCalling && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white text-sm z-50">
                    Đang kết nối cuộc gọi...
                </div>
            )}
        </div>
    );
}

