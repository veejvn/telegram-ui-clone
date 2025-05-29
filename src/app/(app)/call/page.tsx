'use client';

import { useState } from 'react';
import { ContactList } from '@/components/call/ContactList';
import { VoiceCall } from '@/components/call/VoiceCall';
import { VideoCall } from '@/components/call/VideoCall';
import { GroupCall } from '@/components/call/GroupCall';

type CallType = 'voice' | 'video' | 'group';

interface CallState {
  type: CallType;
  contactName: string;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
    isMuted?: boolean;
    isVideoOn?: boolean;
    isSpeaking?: boolean;
  }>;
}

// Mock data for group call
const mockParticipants = [
  {
    id: '1',
    name: 'John Doe',
    avatar: 'https://github.com/shadcn.png',
    isMuted: false,
    isVideoOn: true,
    isSpeaking: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    avatar: 'https://github.com/shadcn.png',
    isMuted: true,
    isVideoOn: false,
    isSpeaking: false
  },
  {
    id: '3',
    name: 'Alice Johnson',
    isMuted: false,
    isVideoOn: true,
    isSpeaking: false
  },
  {
    id: '4',
    name: 'Bob Wilson',
    avatar: 'https://github.com/shadcn.png',
    isMuted: false,
    isVideoOn: false,
    isSpeaking: true
  }
];

export default function CallPage() {
  const [activeCall, setActiveCall] = useState<CallState | null>(null);

  const handleStartCall = (type: CallType, contactName: string) => {
    if (type === 'group') {
      setActiveCall({
        type,
        contactName: 'Group Call',
        participants: mockParticipants
      });
    } else {
      setActiveCall({ type, contactName });
    }
  };

  const handleEndCall = () => {
    setActiveCall(null);
  };

  const handleSwitchToVideo = () => {
    if (activeCall) {
      setActiveCall({ ...activeCall, type: 'video' });
    }
  };

  if (activeCall?.type === 'voice') {
    return (
      <VoiceCall
        contactName={activeCall.contactName}
        onEndCall={handleEndCall}
        onSwitchToVideo={handleSwitchToVideo}
      />
    );
  }

  if (activeCall?.type === 'video') {
    return (
      <VideoCall
        contactName={activeCall.contactName}
        onEndCall={handleEndCall}
      />
    );
  }

  if (activeCall?.type === 'group' && activeCall.participants) {
    return (
      <GroupCall
        groupName={activeCall.contactName}
        participants={activeCall.participants}
        onEndCall={handleEndCall}
        isVideoEnabled={true}
      />
    );
  }

  return (
    <div className="h-screen">
      <ContactList onStartCall={handleStartCall} />
    </div>
  );
}