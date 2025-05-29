// src/components/ui/SettingActions.tsx
import React from 'react';
import { Card, CardContent } from './card';
import { Camera, AtSign, User, Bookmark, PhoneCall, QrCode, Folder, Bell, Lock, Database, Palette, Battery, ChevronRight } from 'lucide-react';

export function SettingActions() {
    const items = [
        { icon: <Camera />, label: 'Set Profile Photo' },
        { icon: <AtSign />, label: 'Set Username' },
        { icon: <User />, label: 'My Profile' },
        { icon: <Bookmark />, label: 'Saved Messages' },
        { icon: <PhoneCall />, label: 'Recent Calls' },
        { icon: <QrCode />, label: 'Devices' },
        { icon: <Folder />, label: 'Chat Folders' },
        { icon: <Bell />, label: 'Notifications and Sounds' },
        { icon: <Lock />, label: 'Privacy and Security' },
        { icon: <Database />, label: 'Data and Storage' },
        { icon: <Palette />, label: 'Appearance' },
        { icon: <Battery />, label: 'Power Saving' },
    ];

    return (
        <Card className="bg-zinc-900 mx-4 mt-4">
            <CardContent className="flex flex-col divide-y divide-zinc-700">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                                {React.cloneElement(item.icon, { className: 'h-5 w-5' })}
                            </div>
                            <span className="text-base text-white">{item.label}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
