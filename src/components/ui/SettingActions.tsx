// src/components/ui/SettingActions.tsx
import React from 'react';
import { Card, CardContent } from './card';
import {
    Camera,
    AtSign,
    User,
    Bookmark,
    PhoneCall,
    QrCode,
    Folder,
    Bell,
    Lock,
    Database,
    Palette,
    Battery,
    ChevronRight
} from 'lucide-react';

interface SettingAction {
    Icon: React.ElementType;
    label: string;
    bgClass: string;
    extra?: React.ReactNode;
}

export function SettingActions() {
    const actions: SettingAction[] = [
        { Icon: Camera, label: 'Set Profile Photo', bgClass: 'bg-purple-600' },
        { Icon: AtSign, label: 'Set Username', bgClass: 'bg-blue-600' },
        { Icon: User, label: 'My Profile', bgClass: 'bg-red-600' },
        { Icon: Bookmark, label: 'Saved Messages', bgClass: 'bg-blue-500' },
        { Icon: PhoneCall, label: 'Recent Calls', bgClass: 'bg-green-500' },
        { Icon: QrCode, label: 'Devices', bgClass: 'bg-orange-500', extra: <span className="text-sm text-gray-400">Scan QR</span> },
        { Icon: Folder, label: 'Chat Folders', bgClass: 'bg-cyan-500' },
        { Icon: Bell, label: 'Notifications and Sounds', bgClass: 'bg-red-500' },
        { Icon: Lock, label: 'Privacy and Security', bgClass: 'bg-gray-500' },
        { Icon: Database, label: 'Data and Storage', bgClass: 'bg-green-600' },
        { Icon: Palette, label: 'Appearance', bgClass: 'bg-blue-700' },
        { Icon: Battery, label: 'Power Saving', bgClass: 'bg-orange-600', extra: <span className="text-sm text-gray-400">Off</span> }
    ];

    return (
        <Card className="bg-zinc-900 mx-4 mt-4">
            <CardContent className="flex flex-col divide-y divide-zinc-700">
                {actions.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                        <div className="flex items-center space-x-3">
                            <div className={`${action.bgClass} h-8 w-8 rounded-full flex items-center justify-center text-white`}>
                                <action.Icon className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-base text-white">{action.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            {action.extra}
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
