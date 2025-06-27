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
          <p className="text-xs text-zinc-400">
            Enter your name and add an optional profile photo.
          </p>

          <Input
            className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />
          <p className="text-xs text-zinc-400">
            You can add a few lines about yourself. Choose who can see your bio
            in <span className="text-blue-400 underline">Settings</span>.
          </p>

          <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
            <p className="text-sm">Date of Birth</p>
            <button className="text-sm text-blue-400">Add</button>
          </div>
          <p className="text-xs text-zinc-400">
            Only your contacts can see your birthday.{" "}
            <span className="text-blue-400 cursor-pointer">Change</span>
          </p>

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

            <AlertDialog>
              <AlertDialogTrigger className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-lg p-3 text-red-500 text-sm text-center mt-2">
                Log Out
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to log out?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You will need to log in again to access your account.
                    <br />
                    <br />
                    If you have multiple accounts, you can switch between them
                    without logging out.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-zinc-300 text-black dark:bg-zinc-700 dark:text-white">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-zinc-300 text-red-500 dark:bg-zinc-700"
                  >
                    Log Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
