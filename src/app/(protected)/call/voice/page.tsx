"use client";

import React, { useState } from "react";
import { useCallHistoryStore } from "@/stores/useCallHistoryStore";
import { useRouter } from "next/navigation";

export default function Page() {
    const [missedOnly, setMissedOnly] = useState(false);
    const [editing, setEditing] = useState(false);
    const router = useRouter();

    const { calls, deleteCall } = useCallHistoryStore();

    const filteredCalls = missedOnly ? calls.filter((c) => c.missed) : calls;

    return (
        <main className="bg-black min-h-screen text-white font-sans pb-16">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pt-4 pb-2">
                <button
                    className={`text-sm ${editing ? "text-red-400" : "text-blue-400"}`}
                    onClick={() => setEditing(!editing)}
                >
                    {editing ? "Done" : "Edit"}
                </button>
                <div className="text-sm flex gap-2 bg-zinc-800 rounded-full px-2 py-1">
                    <button
                        onClick={() => setMissedOnly(false)}
                        className={`font-medium ${!missedOnly ? "text-white" : "text-zinc-400"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setMissedOnly(true)}
                        className={`font-medium ${missedOnly ? "text-white" : "text-zinc-400"}`}
                    >
                        Missed
                    </button>
                </div>
                <div></div>
            </div>

            {/* Start New Call */}
            <div
                className="px-4 py-2 border-t border-zinc-700 flex items-center gap-2 cursor-pointer hover:bg-zinc-900"
                onClick={() => router.push("/call/new")}
            >
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54.57 1 1 0 011 1v3.11a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.11a1 1 0 011 1 11.36 11.36 0 00.57 3.54 1 1 0 01-.21 1.11l-2.2 2.2z" />
                </svg>
                <span className="text-blue-400 font-medium">Start New Call</span>
            </div>

            {/* Section Title */}
            {filteredCalls.length > 0 ? (
                <div className="px-4 py-2 text-xs text-zinc-400 border-t border-zinc-700">
                    {missedOnly ? "MISSED CALLS" : "RECENT CALLS"}
                </div>
            ) : (
                <div className="px-4 py-4 text-sm text-zinc-500 text-center border-t border-zinc-700">
                    {missedOnly ? "No missed calls" : "No recent calls"}
                </div>
            )}

            {/* Call List */}
            {filteredCalls.map((call, idx) => (
                <div
                    key={idx}
                    className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900 cursor-pointer"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {call.name[0]}
                        </div>
                        <div>
                            <div className="font-medium">{call.name}</div>
                            <div className={`text-sm ${call.missed ? "text-red-400" : "text-zinc-400"}`}>
                                {call.status}
                            </div>
                        </div>
                    </div>

                    <div className="text-right text-zinc-400 text-sm flex items-center gap-2">
                        {call.date}
                        {editing && (
                            <button
                                onClick={() => deleteCall(idx)}
                                className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                                title="Xóa cuộc gọi"
                            >
                                −
                            </button>
                        )}
                        {!editing && <span className="text-blue-400">ⓘ</span>}
                    </div>
                </div>
            ))}

            {/* Bottom Tabs */}
            <div className="fixed bottom-0 w-full bg-black border-t border-zinc-700 flex justify-around py-2">
                {["Contacts", "Calls", "Chats", "Settings"].map((item, idx) => (
                    <div
                        key={item}
                        className={`flex flex-col items-center text-xs ${idx === 1 ? "text-blue-400" : "text-zinc-400"}`}
                    >
                        <div className="w-5 h-5 mb-1 bg-zinc-700 rounded-full" />
                        {item}
                    </div>
                ))}
            </div>
        </main>
    );
}
