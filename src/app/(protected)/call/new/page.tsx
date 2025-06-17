"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useClientStore } from "@/stores/useMatrixStore";
import { useRouter } from "next/navigation";

interface Contact {
    id: string;
    name: string;
    lastSeen: string;
    roomId: string;
}

export default function NewCallPage() {
    const { client } = useClientStore();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [search, setSearch] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (!client) return;

        async function fetchContacts() {
            const rooms = client!.getRooms();
            const userMap: Record<string, Contact> = {};

            for (const room of rooms) {
                if (!room || !room.getJoinedMembers) continue;
                const members = room.getJoinedMembers();

                for (const member of members) {
                    const userId = member.userId;
                    if (userId === client!.getUserId()) continue;

                    if (!userMap[userId]) {
                        userMap[userId] = {
                            id: userId,
                            name: member.name || userId,
                            lastSeen: "recently",
                            roomId: room.roomId,
                        };
                    }
                }
            }

            setContacts(Object.values(userMap));
        }

        fetchContacts();
    }, [client]);

    const filtered = contacts
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const grouped = filtered.reduce((acc, contact) => {
        const letter = contact.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(contact);
        return acc;
    }, {} as Record<string, Contact[]>);

    const letters = Object.keys(grouped).sort();

    return (
        <div className="flex h-screen flex-col bg-black text-white">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <button className="text-blue-400 text-sm" onClick={() => router.back()}>Close</button>
                <h1 className="text-sm font-semibold">New Call</h1>
                <div className="w-12" />
            </div>

            {/* Search Input */}
            <div className="px-4 pb-2">
                <Input
                    className="rounded-md bg-zinc-900 border-zinc-700 text-sm placeholder:text-zinc-500"
                    placeholder="Search for contacts or usernames"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Create Call Link */}
            <div className="px-4 pb-2 text-blue-400 text-sm cursor-pointer">+ Create Call Link</div>

            {/* Contact List */}
            <div className="flex-1 relative">
                <ScrollArea className="h-full pr-4">
                    {letters.map((letter) => (
                        <div key={letter}>
                            <div className="px-4 py-1 text-xs text-zinc-500 bg-black sticky top-0 z-10">{letter}</div>
                            {grouped[letter].map((c) => (
                                <div
                                    key={c.id}
                                    className="px-4 py-2 flex items-center gap-3 hover:bg-zinc-900 cursor-pointer"
                                    onClick={() => router.push(`/call/voice?calleeId=${encodeURIComponent(c.id)}&contact=${encodeURIComponent(c.name)}`)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold">
                                        {c.name[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{c.name}</div>
                                        <div className="text-xs text-zinc-400">last seen {c.lastSeen}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </ScrollArea>

                {/* Sidebar letters */}
                <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center pr-1 text-xs text-blue-400">
                    {letters.map((l) => (
                        <div key={l} className="py-0.5">
                            {l}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
