"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EditProfilePage() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [bio, setBio] = useState("");
    const [phone] = useState("+84");

    const handleLogout = async () => {
        try {
            const authService = new MatrixAuthService();
            await authService.logout();
            logout();
            router.push("/login"); // chuyển hướng về trang login nếu muốn
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    
    return (
        <div className="min-h-screen dark:bg-black dark:text-white flex justify-center items-center">
            <Card className="w-full max-w-md dark:bg-zinc-900 border-none shadow-lg rounded-none">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 px-4">
                    <button
                        onClick={() => router.back()}
                        className="text-blue-400 text-sm"
                    >
                        Cancel
                    </button>
                    <button className="text-blue-400 text-sm">Done</button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-2">
                        <span className="text-2xl">📷</span>
                    </div>
                    <p className="text-sm text-blue-400 cursor-pointer">
                        Set New Photo
                    </p>
                </div>

                {/* Form Content */}
                <CardContent className="space-y-4">
                    <Input
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
                    />
                    <Input
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
                    />
                    <p className="text-xs text-zinc-400">
                        Enter your name and add an optional profile photo.
                    </p>

                    <Input
                        placeholder="Bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="dark:bg-zinc-800 border-none dark:text-white placeholder-zinc-500"
                    />
                    <p className="text-xs text-zinc-400">
                        You can add a few lines about yourself. Choose who can see your bio
                        in <span className="text-blue-400 underline">Settings</span>.
                    </p>

                    {/* Date of Birth */}
                    <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                        <p className="text-sm">Date of Birth</p>
                        <button className="text-sm text-blue-400">Add</button>
                    </div>
                    <p className="text-xs text-zinc-400">
                        Only your contacts can see your birthday.{" "}
                        <span className="text-blue-400 cursor-pointer">Change</span>
                    </p>

                    {/* Phone Number */}
                    <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center">
                        <p className="text-sm">Change Number</p>
                        <span className="text-sm text-zinc-400">{phone}</span>
                    </div>

                    {/* Username */}
                    <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center cursor-pointer">
                        <p className="text-sm">Username</p>
                        <span className="text-zinc-400 text-xl">›</span>
                    </div>

                    {/* Color */}
                    <div className="dark:bg-zinc-800 rounded-lg p-3 flex justify-between items-center cursor-pointer">
                        <p className="text-sm">Your Color</p>
                        <span className="text-zinc-400 text-xl">›</span>
                    </div>

                    {/* Add Account */}
                    <div className="mt-6 space-y-2">
                        <button className="w-full dark:bg-zinc-800 rounded-lg p-3 text-blue-400 text-sm text-center">
                            Add Another Account
                        </button>
                        <p className="text-xs text-zinc-400">
                            You can connect multiple accounts with different phone numbers.
                        </p>

                        {/* Logout Confirmation */}
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
                                        If you have multiple accounts, you can switch between them without logging out.
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
