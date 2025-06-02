"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VideoCall } from "@/components/call/VideoCall";

export default function VideoCallPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contactName = searchParams.get("contact") || "Unknown";

    const handleEndCall = () => {
        router.push("/");
    };

    return (
        <VideoCall
            contactName={contactName}
            onEndCall={handleEndCall}
        />
    );
} 