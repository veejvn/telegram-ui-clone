'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SetProfilePhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative py-4 flex items-center justify-center border-b border-zinc-700">
        <button
          className="absolute left-4 text-blue-500 text-sm"
          onClick={() => router.push('/setting')}
        >
          Cancel
        </button>
        <div className="text-center">
          <div className="text-sm font-medium">Recents</div>
          <div className="text-xs text-gray-400">Set new profile photo</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-white"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-green-400">
            Selected file: {selectedFile.name}
          </p>
        )}
      </div>
    </div>
  );
}
