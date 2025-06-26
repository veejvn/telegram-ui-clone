"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Page() {
  const router = useRouter();

  const user = {
    initials: "DQ",
    fullName: "Quynh Diem",
    status: "online",
    phone: "+84 96 825 14 22",
  };

  return ( // <-- Đảm bảo return tồn tại
    <div className="bg-white text-black min-h-screen px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-blue-600 text-sm font-medium pl-1">
          Back
        </button>
        <button onClick={() => router.push("/setting/profile/edit")} className="text-blue-600 text-sm font-medium pl-1">
          Edit
        </button>

      </div>

      {/* Profile Info */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Avatar className="w-20 h-20 bg-purple-600 text-white text-2xl">
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold">{user.fullName}</h2>
        <span className="text-gray-500 text-sm">{user.status}</span>
      </div>

      {/* Phone */}
      <div className="bg-gray-100 rounded-xl p-4 text-left mb-6">
        <p className="text-xs text-gray-500 mb-1">mobile</p>
        <p className="text-sm text-blue-600">{user.phone}</p>
      </div>

      {/* Posts Section */}
      <div>
        <h3 className="text-sm font-semibold text-black mb-2">Posts</h3>
        <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center py-12 text-center">
          <img
            src="/no-posts-placeholder.png"
            alt="No posts"
            className="w-24 h-24 mb-4"
          />
          <p className="text-sm text-gray-500 mb-2">No posts yet...</p>
          <p className="text-xs text-gray-400 mb-4">
            Publish photos and videos to display on your profile page.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Add a Post
          </Button>
        </div>
      </div>
    </div>
  );
}
