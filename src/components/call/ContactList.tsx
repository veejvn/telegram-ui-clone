'use client';

import { useState } from 'react';
import { User, Phone, Video, Search, ArrowLeft, History, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    lastSeen: string;
    hasUnreadCalls?: boolean;
    lastCallType?: 'incoming' | 'outgoing' | 'missed';
    lastCallTime?: string;
}

interface ContactListProps {
    onStartCall?: (type: 'voice' | 'video' | 'group', contactName: string) => void;
}

const mockContacts: Contact[] = [
    {
        id: '1',
        name: 'John Doe',
        avatar: 'https://github.com/shadcn.png',
        lastSeen: 'last seen recently',
        lastCallType: 'missed',
        lastCallTime: '2 hours ago',
        hasUnreadCalls: true
    },
    {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://github.com/shadcn.png',
        lastSeen: 'last seen 2 hours ago',
        lastCallType: 'outgoing',
        lastCallTime: 'yesterday'
    },
    {
        id: '3',
        name: 'Alice Johnson',
        avatar: 'https://github.com/shadcn.png',
        lastSeen: 'last seen 1 day ago',
        lastCallType: 'incoming',
        lastCallTime: '3 days ago'
    },
    {
        id: '4',
        name: 'Bob Wilson',
        avatar: 'https://github.com/shadcn.png',
        lastSeen: 'last seen 3 days ago',
        lastCallType: 'outgoing',
        lastCallTime: 'last week'
    }
];

export function ContactList({ onStartCall }: ContactListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showHistory, setShowHistory] = useState(true);

    const filteredContacts = mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCallIcon = (type?: 'incoming' | 'outgoing' | 'missed') => {
        switch (type) {
            case 'incoming':
                return <Phone className="h-4 w-4 text-green-500 rotate-90" />;
            case 'outgoing':
                return <Phone className="h-4 w-4 text-blue-500 -rotate-90" />;
            case 'missed':
                return <Phone className="h-4 w-4 text-red-500 rotate-90" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1c1c1e]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-semibold text-white">Calls</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:text-blue-500"
                        onClick={() => onStartCall?.('group', 'New Group Call')}
                    >
                        <Users className="h-6 w-6" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("text-white", showHistory && "text-blue-500")}
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <History className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search"
                        className="pl-9 bg-gray-800 border-none text-white placeholder:text-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto">
                {filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-800/50 cursor-pointer border-b border-gray-800/50"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-gray-700">
                                {contact.avatar ? (
                                    <img src={contact.avatar} alt={contact.name} className="rounded-full" />
                                ) : (
                                    <User className="h-6 w-6 text-gray-400" />
                                )}
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-white">{contact.name}</h3>
                                    {contact.hasUnreadCalls && (
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    {getCallIcon(contact.lastCallType)}
                                    <span>{contact.lastCallTime}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-gray-400 hover:text-white hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartCall?.('voice', contact.name);
                                }}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-gray-400 hover:text-white hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStartCall?.('video', contact.name);
                                }}
                            >
                                <Video className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 