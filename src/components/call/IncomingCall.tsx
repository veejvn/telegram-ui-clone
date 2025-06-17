'use client';

import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IncomingCallProps {
    callerName: string;
    onAccept: () => void;
    onReject: () => void;
}

export function IncomingCall({ callerName, onAccept, onReject }: IncomingCallProps) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 text-white">
            <h2 className="text-2xl font-semibold mb-2">{callerName}</h2>
            <p className="text-gray-300 mb-8">Incoming call...</p>

            <div className="flex gap-8">
                <Button
                    onClick={onAccept}
                    className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
                >
                    <Phone className="w-6 h-6" />
                </Button>
                <Button
                    onClick={onReject}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
