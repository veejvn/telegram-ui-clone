"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import useCallHistoryStore, { CallRecord } from "@/stores/useCallHistoryStore";
import { getLS } from "@/tools/localStorage.tool";
// import { callService } from "@/services/callService";

export default function CallHistoryPage() {
  const [missedOnly, setMissedOnly] = useState(false);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const history = useCallHistoryStore((s) => s.history);
  const removeCall = useCallHistoryStore((s) => s.removeCall);
  const clearAll = useCallHistoryStore((s) => s.clearAll);

  const filtered = missedOnly
    ? history.filter((r) => r.status === "missed")
    : history;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  const formatDur = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="dark:bg-black min-h-screen dark:text-white font-sans pb-16">
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <button
          className={`text-sm ${editing ? "text-red-400" : "text-blue-400"}`}
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? "Done" : "Edit"}
        </button>
        <div className="text-sm flex gap-2 dark:bg-zinc-800 rounded-full px-2 py-1">
          <button
            onClick={() => setMissedOnly(false)}
            className={`font-medium ${
              !missedOnly ? "dark:text-white" : "text-zinc-400"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setMissedOnly(true)}
            className={`font-medium ${
              missedOnly ? "dark:text-white" : "text-zinc-400"
            }`}
          >
            Missed
          </button>
        </div>
        <div className="w-10" /> {/* placeholder */}
      </div>

      {/* Start New Call */}
      <div
        className="px-4 py-2 border-t border-zinc-700 flex items-center gap-2 cursor-pointer hover:bg-zinc-900"
        onClick={() => router.push("/call/new")}
      >
        <svg
          className="w-5 h-5 text-blue-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21 11.36 11.36 0 003.54.57 1 1 0 011 1v3.11a1 1 0 01-1 1A17 17 0 013 5a1 1 0 011-1h3.11a1 1 0 011 1 11.36 11.36 0 00.57 3.54 1 1 0 01-.21 1.11l-2.2 2.2z" />
        </svg>
        <span className="text-blue-400 font-medium">Start New Call</span>
      </div>

      {/* Section Title */}
      {filtered.length > 0 ? (
        <div className="px-4 py-2 text-xs text-zinc-400 border-t border-zinc-700">
          {missedOnly ? "MISSED CALLS" : "RECENT CALLS"}
        </div>
      ) : (
        <div className="px-4 py-4 text-sm text-zinc-500 text-center border-t border-zinc-700">
          {missedOnly ? "No missed calls" : "No recent calls"}
        </div>
      )}

      {/* Call List */}
      {filtered.map((call: CallRecord) => (
        <div
          key={call.id}
          className="px-4 py-3 flex items-center justify-between hover:bg-zinc-900 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(call.calleeName || call.calleeId).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">
                {call.calleeName || call.calleeId}
              </div>
              <div
                className={`text-sm ${
                  call.status === "missed"
                    ? "text-red-400"
                    : call.status === "rejected"
                    ? "text-yellow-400"
                    : "text-zinc-400"
                }`}
              >
                {call.status.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="text-right text-zinc-400 text-sm flex items-center gap-4">
            <div>
              {formatDate(call.timestamp)}
              {" • "}
              {formatDur(call.duration)}
            </div>
            {editing ? (
              <button
                onClick={() => removeCall(call.id)}
                className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold"
                title="Delete call"
              >
                −
              </button>
            ) : (
              <span className="text-blue-400">ⓘ</span>
            )}
          </div>
        </div>
      ))}

      {/* Bottom Tabs */}
      <div className="fixed bottom-0 w-full bg-black border-t border-zinc-700 flex justify-around py-2">
        {["Contacts", "Calls", "Chats", "Settings"].map((item, idx) => (
          <div
            key={item}
            className={`flex flex-col items-center text-xs ${
              idx === 1 ? "text-blue-400" : "text-zinc-400"
            }`}
          >
            <div className="w-5 h-5 mb-1 bg-zinc-700 rounded-full" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
