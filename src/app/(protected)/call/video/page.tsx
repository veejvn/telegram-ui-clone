"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoCall } from "@/components/call/VideoCall";
import { useVideoCall } from "@/stores/useVideocall";
import { useClientStore } from "@/stores/useMatrixStore";

export default function VideoCallPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const calleeId = searchParams.get("calleeId");
    const contactName = searchParams.get("contact") || calleeId?.split(":")[0].replace("@", "") || "Unknown";

    const { client } = useClientStore();
    const { startCall, endCall } = useVideoCall();

    useEffect(() => {
        if (client && calleeId) {
            startCall(client, calleeId);
        }

        return () => {
            endCall();
        };
    }, [client, calleeId]);

    const handleEndCall = () => {
        endCall();
        router.replace("/call");
    };

    return (
        <VideoCall
            contactName={contactName}
            onEndCall={handleEndCall}
        />
    );
}
