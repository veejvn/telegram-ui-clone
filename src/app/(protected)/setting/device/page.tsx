'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ChevronLeft } from 'lucide-react';
import { MdPhoneIphone } from 'react-icons/md'; // icon điện thoại
import Image from 'next/image'; // dùng để hiển thị ảnh minh họa

export default function DevicesPage() {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const router = useRouter();

    const handleScan = () => {
        // TODO: thay bằng logic scan thật
        setScannedData('DeviceID-12345');
    };

    const isDark = typeof window !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : false;

    const cardBg = isDark ? "bg-[#23232b]" : "bg-white";
    const cardBorder = isDark ? "" : "border border-zinc-200";
    const sectionBg = isDark ? "bg-black" : "bg-white";
    const textColor = isDark ? "text-white" : "text-black";
    const subTextColor = isDark ? "text-gray-400" : "text-gray-600";
    const inputBg = isDark ? "bg-[#18181b]" : "bg-white";

    return (
        <div className={`min-h-screen ${sectionBg} ${textColor} p-0`}>
            {/* Header */}
            <div className="flex items-center px-4 pt-4 pb-2">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-1 text-blue-400 font-medium text-base"
                >
                    <ChevronLeft className="h-5 w-5" />
                    <span>Back</span>
                </button>
                <div className="flex-1 text-center text-lg font-semibold -ml-8">Devices</div>
                <div className="w-12" />
            </div>

            {/* Main content */}
            <div className="px-4">
                {/* Laptop image minh họa theo theme */}
                <div className="flex flex-col items-center mt-2 mb-4">
                    <div className="rounded-2xl p-2 mb-2 bg-transparent">
                        <Image
                            src={isDark
                                ? "/images/icon-device/laptop-dark.png"
                                : "/images/icon-device/laptop-light.png"
                            }
                            alt="Laptop Illustration"
                            width={120}
                            height={120}
                            className="rounded-xl transition-all"
                        />
                    </div>
                    <div className="text-center text-[15px] text-gray-300">
                        Link <span className="text-blue-400">Telegram Desktop</span> or <span className="text-blue-400">Telegram Web</span> by scanning a QR code.
                    </div>
                </div>

                {/* Link Desktop Device Button */}
                <button
                    onClick={handleScan}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 transition-all text-white font-medium rounded-full py-3 text-base mb-6 shadow-md"
                >
                    <QrCode className="h-5 w-5" />
                    Link Desktop Device
                </button>

                {/* This Device */}
                <div className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1 tracking-wider">
                    This Device
                </div>
                <div className={`${cardBg} ${cardBorder} rounded-2xl px-4 py-3 flex items-center mb-2`}>
                    <div className="bg-blue-500 rounded-xl h-9 w-9 flex items-center justify-center mr-3">
                        <MdPhoneIphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-[15px] truncate">iPhone 11 Pro Max</div>
                        <div className={`text-xs ${subTextColor} truncate`}>Telegram iOS 11.12.1</div>
                        <div className={`text-xs ${subTextColor} truncate`}>Can Tho, Vietnam · online</div>
                    </div>
                </div>
                <div className={`text-xs ${subTextColor} px-1 mb-6`}>
                    The official Telegram App is available for iPhone, iPad, Android, macOS, Windows and Linux. <a href="#" className="text-blue-400 underline">Learn More</a>
                </div>

                {/* Auto terminate section */}
                <div className="uppercase text-xs text-gray-400 font-semibold mb-2 px-1 tracking-wider">
                    Automatically Terminate Old Sessions
                </div>
                <div className={`${cardBg} ${cardBorder} rounded-2xl flex items-center justify-between px-4 py-3`}>
                    <span className="text-[15px]">If Inactive For</span>
                    <button className="flex items-center text-[15px] text-gray-300 font-medium">
                        6 months
                        <ChevronLeft className="h-5 w-5 rotate-180 ml-1 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
