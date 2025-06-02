"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";

// Mock data - replace with your actual data source
const mockContacts = [
    {
        id: "1",
        name: "Thanh Thảo",
        lastSeen: "last seen recently",
    },
    {
        id: "2",
        name: "Jane Smith",
        lastSeen: "last seen 1 hour ago",
    },
    {
        id: "3",
        name: "Mike Johnson",
        lastSeen: "online",
    },
];

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const contact = mockContacts.find(c => c.id === id);

    if (!contact) {
        return null;
    }

    const handleBack = () => {
        router.back();
    };

    const handleVoiceCall = () => {
        router.push(`/call/voice?contact=${encodeURIComponent(contact.name)}`);
    };

    const handleVideoCall = () => {
        router.push(`/call/video?contact=${encodeURIComponent(contact.name)}`);
    };

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-semibold">Call Options</h1>
                </div>
            </div>

            {/* Contact Info and Call Options */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <Avatar className="w-32 h-32 mb-6">
                    <AvatarFallback className="text-4xl">
                        {contact.name[0]}
                    </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2">{contact.name}</h2>
                <p className="text-zinc-400 mb-12">{contact.lastSeen}</p>

                {/* Call Buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white py-6"
                        onClick={handleVoiceCall}
                    >
                        <Phone className="mr-2 h-5 w-5" />
                        Voice Call
                    </Button>
                    <Button
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-6"
                        onClick={handleVideoCall}
                    >
                        <Video className="mr-2 h-5 w-5" />
                        Video Call
                    </Button>
                </div>
            </div>
        </div>
    );
} 