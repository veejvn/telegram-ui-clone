"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaApple, FaGoogle, FaTelegramPlane } from "react-icons/fa";

export default function ConnectSocialPage() {
    const router = useRouter();

    const handleConnect = (platform: string) => {
        console.log(`Connecting to ${platform}...`);
        // Handle social connection logic here
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-2">
            <div className="bg-white/20 rounded-[32px] min-h-[540px] px-6 py-8 shadow-lg backdrop-blur-[16px] flex flex-col items-center w-full max-w-md">
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">Connect to social</h1>
                    <p className="text-sm text-gray-600">
                        New Generation Teknix Account: Safe, Fast and Conveniently Integrated.
                    </p>
                </div>

                {/* Social Options */}
                <div className="w-full divide-y divide-gray-200">
                    {/* Apple ID */}
                    <div className="flex items-center justify-between py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                                <FaApple className="w-8 h-8 text-white" />
                            </div>
                            <span className="font-semibold text-lg text-gray-900">Apple ID</span>
                        </div>
                        <button
                            onClick={() => handleConnect('Apple')}
                            className="px-7 py-2 bg-blue-600 text-white rounded-full font-semibold text-base hover:bg-blue-700 transition shadow"
                        >
                            Connect
                        </button>
                    </div>

                    {/* Google Account */}
                    <div className="flex items-center justify-between py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                                <FaGoogle className="w-8 h-8 text-white" />
                            </div>
                            <span className="font-semibold text-lg text-gray-900">Google Account</span>
                        </div>
                        <button
                            onClick={() => handleConnect('Google')}
                            className="px-7 py-2 bg-blue-600 text-white rounded-full font-semibold text-base hover:bg-blue-700 transition shadow"
                        >
                            Connect
                        </button>
                    </div>

                    {/* Telegram */}
                    <div className="flex items-center justify-between py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center">
                                <FaTelegramPlane className="w-8 h-8 text-white" />
                            </div>
                            <span className="font-semibold text-lg text-gray-900">Telegram</span>
                        </div>
                        <button
                            onClick={() => handleConnect('Telegram')}
                            className="px-7 py-2 bg-blue-600 text-white rounded-full font-semibold text-base hover:bg-blue-700 transition shadow"
                        >
                            Connect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}