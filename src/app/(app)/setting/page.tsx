'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
Smartphone,
  ChevronRight,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface SettingItem {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
  path?: string;
}

const settings: SettingItem[] = [
  { title: 'My Profile', icon: <User className="h-6 w-6 text-red-500" />, path: '/setting/profile' },
  { title: 'Saved Messages', icon: <Bookmark className="h-6 w-6 text-blue-500" />, path: '/setting/saved-messages' },
  { title: 'Recent Calls', icon: <PhoneCall className="h-6 w-6 text-green-500" />, path: '/setting/recent-calls' },
  { title: 'Devices', icon: <QrCode className="h-6 w-6 text-orange-500" />, extra: <span className="text-sm text-gray-400">Scan QR</span>, path: '/setting/device' },
  { title: 'Chat Folders', icon: <Folder className="h-6 w-6 text-cyan-500" />, path: '/setting/chat-folders' },
  { title: 'Notifications and Sounds', icon: <Bell className="h-6 w-6 text-red-500" />, path: '/setting/notifications' },
  { title: 'Privacy and Security', icon: <Lock className="h-6 w-6 text-gray-400" />, path: '/setting/privacy' },
  { title: 'Data and Storage', icon: <Database className="h-6 w-6 text-green-600" />, path: '/setting/data-storage' },
  { title: 'Appearance', icon: <Palette className="h-6 w-6 text-blue-700" />, path: '/setting/appearance' },
  { title: 'Power Saving', icon: <Battery className="h-6 w-6 text-orange-600" />, extra: <span className="text-sm text-gray-400">Off</span>, path: '/setting/power-saving' }
  { title: 'My Profile', icon: <User className="h-6 w-6 text-red-500" />, path: '/setting/profile' },
  { title: 'Saved Messages', icon: <Bookmark className="h-6 w-6 text-blue-500" />, path: '/setting/saved-message' },
  { title: 'Recent Calls', icon: <PhoneCall className="h-6 w-6 text-green-500" />, path: '/setting/recent-call' },
  { title: 'Devices', icon: <Smartphone className="h-6 w-6 text-orange-500" />, extra: <span className="text-sm text-gray-400">Scan QR</span>, path: '/setting/device' },
  { title: 'Chat Folders', icon: <Folder className="h-6 w-6 text-cyan-500" />, path: '/setting/chat-folder' },
  { title: 'Notifications and Sounds', icon: <Bell className="h-6 w-6 text-red-500" />, path: '/setting/notification-and-sound' },
  { title: 'Privacy and Security', icon: <Lock className="h-6 w-6 text-gray-400" />, path: '/setting/privacy-and-security' },
  { title: 'Data and Storage', icon: <Database className="h-6 w-6 text-green-600" />, path: '/setting/data-and-storage' },
  { title: 'Appearance', icon: <Palette className="h-6 w-6 text-blue-700" />, path: '/setting/appearance' },
  { title: 'Language', icon: <Globe className="h-6 w-6 text-violet-600" />, extra: <span className="text-sm text-gray-400">English</span>, path: '/setting/language' },
];

export default function SettingsPage() {
  const [toggles] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const navigate = (path?: string) => {
    if (path) router.push(path);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative bg-black">
        <div className="flex items-center justify-between px-4 pt-4">
          <Camera className="h-6 w-6 text-white cursor-pointer" onClick={() => navigate('/setting/device')} />
          <div className="absolute left-1/2 transform -translate-x-1/2 top-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">DQ</AvatarFallback>
            </Avatar>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/setting/profile')}>Edit</Button>
        </div>
        <div className="mt-16 text-center px-4 pb-4">
          <h1 className="text-2xl font-semibold">Diem Quynh</h1>
          <p className="text-sm text-gray-400">+84 96 825 14 22</p>

          return (
          <>
            {/* Header */}
            <div className="relative bg-black">
              <div className="flex items-center justify-between px-4 pt-4">
                <QrCode className="h-6 w-6 text-blue-500" />
                <div className="absolute left-1/2 transform -translate-x-1/2 top-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-xl">You</AvatarFallback>
                  </Avatar>
                </div>
                <Button className='text-blue-500 bg-transparent' size="sm">Edit</Button>
              </div>
              <div className="mt-16 text-center px-4 pb-4">
                <h1 className="text-2xl font-semibold">Your Name</h1>
                <p className="text-sm text-gray-400">+84 12345689</p>
              </div>
            </div>

            {/* Action Shortcuts */}
            <div className="mx-4 mt-4 bg-zinc-900 rounded-2xl divide-y divide-zinc-700">
              {[
                { Icon: Camera, label: 'Set Profile Photo', path: '/setting/profile' },
                { Icon: AtSign, label: 'Set Username', path: '/setting/username' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
                      <item.Icon className="h-5 w-5" />
                    </div>
                    <span className="text-base">{item.label}</span>
                    {[Camera, AtSign].map((Icon, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-indigo-600 h-9 w-9 rounded-full flex items-center justify-center text-white">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-base">{idx === 0 ? 'Set Profile Photo' : 'Set Username'}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Settings List */}
                  <div className="p-4 space-y-2">
                    {settings.map((item) => (
          <div
            key={item.title}
            className="flex items-center justify-between bg-zinc-900 rounded-2xl px-4 py-3 cursor-pointer"
            onClick={() => navigate(item.path)}
      {/* Settings List */}
      <div className="p-4 space-y-2">
        {settings.map((item) => (
          <Link
            key={item.title}
            className="flex items-center justify-between bg-zinc-900 rounded-2xl px-4 py-3"
            href={item.path || '#'}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              {item.extra}
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
                </Link>
              ))}
              <div className='h-14'></div>
            </div>
          </>
          );
}
