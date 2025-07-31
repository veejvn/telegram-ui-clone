"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Xử lý logic gửi email reset password
    console.log("Sending reset email to:", email);
    // Chuyển đến trang OTP verification
    router.push(ROUTES.OTP_VERIFICATION);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-2">
      <div className="bg-white/30 rounded-[32px] min-h-[350px] px-6 py-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.10)] backdrop-blur-[16px] flex flex-col justify-center items-center w-full max-w-md">
        {/* Header */}
        <div className="w-full text-center mb-8">
          <p className="text-sm text-gray-900 mb-4 font-bold font-sans">Log in</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1 font-sans">Forgot Password</h1>
          <p className="text-sm text-gray-600 font-sans">New Generation Teknix Account: Safe, Fast and Conveniently Integrated.</p>
        </div>

        {/* Form */}
        <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-sans">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:outline-none text-sm placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light font-sans"
              required
            />
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.2),inset_1px_1px_2px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] font-sans"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
