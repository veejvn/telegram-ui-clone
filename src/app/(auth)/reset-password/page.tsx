"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Confirm password does not match, try again");
            return;
        }
        setError("");
        // Xử lý đổi mật khẩu thành công
        alert("Password reset successfully!");
        router.push(ROUTES.LOGIN);
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-2">
            <div className="bg-white/30 rounded-[32px] min-h-[350px] px-6 py-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.10)] backdrop-blur-[16px] flex flex-col justify-center items-center w-full max-w-md">
                <div className="w-full text-center mb-8">
                    <p className="text-lg text-gray-900 mb-4 font-bold font-sans">Log in</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 font-sans">Enter OTP to Reset Password</h1>
                    <p className="text-sm text-gray-600 font-sans">New Generation Teknix Account: Safe, Fast and Conveniently Integrated.</p>
                </div>
                <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-base font-bold text-gray-900 mb-2 font-sans">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-2xl border-none bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.08)] focus:outline-none text-base placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light font-sans"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-base font-bold text-gray-900 mb-2 font-sans">Confirm password</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                className="w-full px-4 py-3 rounded-2xl border-none bg-white/70 shadow-[0_4px_24px_rgba(0,0,0,0.08)] focus:outline-none text-base placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light font-sans"
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowConfirm(v => !v)}
                                tabIndex={-1}
                            >
                                {showConfirm ? (
                                    <EyeIcon className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm font-sans -mt-4">{error}</div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.2),inset_1px_1px_2px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] font-sans mt-2"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}