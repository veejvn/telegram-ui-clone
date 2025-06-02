"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { VoiceCall } from "@/components/call/VoiceCall";

export default function VoiceCallPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const contactName = searchParams.get("contact") || "Unknown";

    const handleEndCall = () => {
        router.push("/");
    };

    const handleSwitchToVideo = () => {
        router.replace(`/call/video?contact=${encodeURIComponent(contactName)}`);
    };

    return (
        <VoiceCall
            contactName={contactName}
            onEndCall={handleEndCall}
            onSwitchToVideo={handleSwitchToVideo}
        />
    );
} 