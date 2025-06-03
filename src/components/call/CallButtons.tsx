"use client";

import { useRouter } from "next/navigation";
import { Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallButtonsProps {
    contactName: string;
    variant?: "icon" | "large";
    className?: string;
}

export function CallButtons({ contactName, variant = "icon", className = "" }: CallButtonsProps) {
    const router = useRouter();

    const handleVoiceCall = () => {
        router.push(`/call/voice?contact=${encodeURIComponent(contactName)}`);
    };

    const handleVideoCall = () => {
        router.push(`/call/video?contact=${encodeURIComponent(contactName)}`);
    };

    if (variant === "large") {
        return (
            <div className={`flex space-x-4 ${className}`}>
                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full w-16 h-16"
                    onClick={handleVoiceCall}
                >
                    <Phone className="h-6 w-6" />
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full w-16 h-16"
                    onClick={handleVideoCall}
                >
                    <Video className="h-6 w-6" />
                </Button>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 ${className}`}>
            <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleVoiceCall}
            >
                <Phone className="h-4 w-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleVideoCall}
            >
                <Video className="h-4 w-4" />
            </Button>
        </div>
    );
} 