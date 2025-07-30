"use client";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { ArrowRightOnRectangleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen px-2">
      <div className="bg-white/20 rounded-[32px] px-8 py-12 w-full max-w-xl min-h-[500px] flex flex-col justify-center items-center border border-gray-200 drop-shadow-[0_8px_32px_rgba(0,0,0,0.10)] backdrop-blur-[12px]">
        <ArrowRightOnRectangleIcon className="w-12 h-12 text-gray-500 mb-6" />
        <h1 className="text-2xl font-bold mb-3 text-center">Welcome to Ting tong</h1>
        <p className="text-gray-500 text-center mb-8 text-base">
          New Generation Teknix Account. Safe, Fast and Conveniently Integrated.
        </p>
        <div className="flex w-full gap-3 mt-4">
          <button
            className="flex-1 py-3 rounded-[30px] border border-gray-200 bg-white text-gray-700 font-medium text-base shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.7),inset_1px_1px_2px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-200"
            onClick={() => router.push(ROUTES.LOGIN)}
          >
            Log in
          </button>
          <button
            className="flex-1 py-3 rounded-[30px] bg-blue-500 text-white font-medium text-base shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.2),inset_1px_1px_2px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] hover:bg-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => router.push(ROUTES.CHAT)}
          >
            Get started
            <ArrowRightIcon className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
