"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ChangeInformationPage() {
    const router = useRouter();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Confirm password dose not match, try again");
            return;
        }

        setError("");
        // Handle change information logic here
        console.log("Change information submitted:", { username, newPassword, confirmPassword });
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-2">
            <div className="bg-white/30 rounded-[32px] min-h-[540px] px-6 py-8 shadow-lg backdrop-blur-[16px] flex flex-col items-center w-full max-w-md">
                {/* Header với nút back bo tròn, chữ Supplement căn giữa */}
                <div className="relative w-full flex flex-col items-center mb-6">
                    <button
                        onClick={() => router.back()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md"
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                        aria-label="Back"
                    >
                        <ArrowLeftIcon className="w-7 h-7 text-black" />
                    </button>
                    <span className="text-2xl font-bold text-black" style={{ fontFamily: "inherit" }}>
                        Supplement
                    </span>
                </div>

                {/* Main Content */}
                <div className="w-full text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Change Information</h1>
                    <p className="text-sm text-gray-600">
                        New Generation Teknix Account: Safe, Fast and Conveniently Integrated.
                    </p>
                </div>

                {/* Form */}
                <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
                    {/* Username */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">User Name</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter user name"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:outline-none text-sm placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light"
                        />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:outline-none text-sm pr-12 placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowNewPassword((v) => !v)}
                            >
                                {showNewPassword
                                    ? <EyeIcon className="w-5 h-5 text-gray-400" />
                                    : <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:outline-none text-sm pr-12 placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                            >
                                {showConfirmPassword
                                    ? <EyeIcon className="w-5 h-5 text-gray-400" />
                                    : <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-500 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Continue Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}