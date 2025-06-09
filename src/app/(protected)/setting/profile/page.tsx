"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MatrixAuthService } from '@/services/matrix-auth';
import { useRouter } from 'next/navigation';

export default function TelegramProfile() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [phone] = useState('+84');

  const handleLogout = async () => {
    try {
      const authService = new MatrixAuthService();
      await authService.logout()
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="dark:bg-black dark:text-white flex justify-center items-center">
      <Card className="dark:bg-zinc-900 border-none shadow-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="text-blue-400 text-sm">Cancel</button>
          <button className="text-blue-400 text-sm">Done</button>
        </div>

        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
            <span className="text-2xl">📷</span>
          </div>
          <p className="text-sm text-blue-400">Set New Photo</p>
        </div>

        <CardContent className="space-y-4">
          <Input
            className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />
          <Input
            className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />
          <p className="text-xs text-zinc-400">Enter your name and add an optional profile photo.</p>

          <Input
            className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <p className="text-xs text-zinc-400">You can add a few lines about yourself. Choose who can see your bio in <span className='text-blue-400 underline'>Settings</span>.</p>

          <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm">Date of Birth</p>
            <button className="text-sm text-blue-400">Add</button>
          </div>
          <p className="text-xs text-zinc-400">Only your contacts can see your birthday. <span className="text-blue-400 cursor-pointer">Change</span></p>

          <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm">Change Number</p>
            <span className="text-sm text-zinc-400">{phone}</span>
          </div>

          <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm">Username</p>
            <span className="text-zinc-400 text-xl">›</span>
          </div>

          <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm">Your Color</p>
            <span className="text-zinc-400 text-xl">›</span>
          </div>
          <div className="mt-6 space-y-2">
            <button className="w-full dark:bg-zinc-800 rounded-lg p-3 text-blue-400 text-sm text-center">
              Add Another Account
            </button>
            <p className="text-xs text-zinc-400">
              You can connect multiple accounts with different phone numbers.
            </p>

            <Button onClick={handleLogout} className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg p-3 text-red-500 text-sm text-center mt-2">
              Log Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
