"use client";
import { getHeaderStyleWithStatusBar } from "@/utils/getHeaderStyleWithStatusBar";
import Head from "next/head";

export default function AskQuestionPage() {
    const headerStyle = getHeaderStyleWithStatusBar();

    // Mặc định màu sáng, nếu muốn lấy theme hiện tại thì nhận props hoặc hook theme (có thể bổ sung sau)
    const bgColor = "#f5f6fa";

    return (
        <div className="min-h-screen bg-[#f5f6fa] text-black">
            <Head>
                <meta name="theme-color" content={bgColor} />
            </Head>
            <div style={headerStyle} className="p-6 text-center text-lg font-semibold">
                Ask a Question Page
            </div>
        </div>
    );
}
