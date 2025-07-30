"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function OtpVerificationPage() {
    const router = useRouter();
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [authenticatorOtp, setAuthenticatorOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(59);
    const [otpTitle, setOtpTitle] = useState('Forgot Password');
    const [otpError, setOtpError] = useState(false);
    const [authOtpError, setAuthOtpError] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 59));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (otpCode.every(v => v === '')) setOtpError(false);
    }, [otpCode]);
    useEffect(() => {
        if (authenticatorOtp.every(v => v === '')) setAuthOtpError(false);
    }, [authenticatorOtp]);

    const handleOtpChange = (index: number, value: string, type: 'otp' | 'authenticator') => {
        if (otpTitle === 'Forgot Password' && value !== '') {
            setOtpTitle('Enter OTP to Reset Password');
        }
        const currentArray = type === 'otp' ? otpCode : authenticatorOtp;
        const setArray = type === 'otp' ? setOtpCode : setAuthenticatorOtp;
        const newArray = [...currentArray];
        newArray[index] = value;
        setArray(newArray);

        // Nếu tất cả ô đều rỗng thì reset lỗi
        if (type === 'otp' && newArray.every(v => v === '')) setOtpError(false);
        if (type === 'authenticator' && newArray.every(v => v === '')) setAuthOtpError(false);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.querySelector(`input[name="${type}-${index + 1}"]`) as HTMLInputElement;
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, type: 'otp' | 'authenticator') => {
        const currentArray = type === 'otp' ? otpCode : authenticatorOtp;
        const setArray = type === 'otp' ? setOtpCode : setAuthenticatorOtp;

        if (e.key === 'Backspace') {
            e.preventDefault();

            // Nếu ô hiện tại có số, xóa số đó
            if (currentArray[index] !== '') {
                const newArray = [...currentArray];
                newArray[index] = '';
                setArray(newArray);
            }
            // Nếu ô hiện tại trống và có ô trước đó, xóa số ở ô trước
            else if (index > 0) {
                const newArray = [...currentArray];
                newArray[index - 1] = '';
                setArray(newArray);

                // Focus vào ô trước đó
                const prevInput = document.querySelector(`input[name="${type}-${index - 1}"]`) as HTMLInputElement;
                if (prevInput) prevInput.focus();
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Giả lập kiểm tra: chỉ báo lỗi cho mã nào đã nhập và sai
        let otpHasValue = otpCode.some(v => v !== '');
        let authHasValue = authenticatorOtp.some(v => v !== '');
        let otpIsCorrect = otpHasValue && otpCode.join('') === '123456'; // ví dụ mã đúng là 123456
        let authIsCorrect = authHasValue && authenticatorOtp.join('') === '654321'; // ví dụ mã đúng là 654321

        if (!otpHasValue && !authHasValue) {
            setOtpError(false);
            setAuthOtpError(false);
            return;
        }
        if (otpHasValue && !otpIsCorrect) {
            setOtpError(true);
        } else {
            setOtpError(false);
        }
        if (authHasValue && !authIsCorrect) {
            setAuthOtpError(true);
        } else {
            setAuthOtpError(false);
        }
        // Nếu nhập đúng 1 trong 2 mã thì cho phép đổi pass (ở đây chỉ log ra)
        if ((otpHasValue && otpIsCorrect) || (authHasValue && authIsCorrect)) {
            router.push(ROUTES.RESET_PASSWORD);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-center min-h-screen px-2">
            <div className="bg-white/30 rounded-[32px] min-h-[220px] px-6 py-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.10)] backdrop-blur-[16px] flex flex-col justify-center items-center w-full max-w-md">
                {/* Header */}
                <div className="w-full text-center mb-8">
                    <p className="text-lg text-gray-900 mb-4 font-bold font-sans">Log in</p>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 font-sans">{otpTitle}</h1>
                    <p className="text-sm text-gray-600 font-sans">New Generation Teknix Account: Safe, Fast and Conveniently Integrated.</p>
                </div>

                {/* Form */}
                <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
                    {/* OTP Code Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-700 font-sans">OTP Code</label>
                            <span className="text-sm text-blue-600 font-sans">{formatTime(timer)}</span>
                        </div>

                        <div className="flex gap-3 justify-center">
                            {otpCode.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    name={`otp-${index}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value, 'otp')}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'otp')}
                                    className="w-12 h-12 text-center border-b-2 border-gray-300 bg-transparent text-2xl font-bold text-gray-900 font-sans focus:border-blue-500 focus:outline-none"
                                    maxLength={1}
                                />
                            ))}
                        </div>

                        <div className="text-center min-h-[24px]">
                            {otpError ? (
                                <span className="text-sm text-red-500 font-sans">OTP code is incorrect</span>
                            ) : (
                                <>
                                    <span className="text-sm text-gray-500 font-sans">Didn't get a code? </span>
                                    <button type="button" className="text-sm text-blue-600 hover:underline font-sans">
                                        Resend OTP
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Authenticator OTP Code Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-semibold text-gray-700 font-sans">Authenticator OTP Code</label>
                            <span className="text-sm text-blue-600 font-sans">{formatTime(timer)}</span>
                        </div>

                        <div className="flex gap-3 justify-center">
                            {authenticatorOtp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    name={`authenticator-${index}`}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value, 'authenticator')}
                                    onKeyDown={(e) => handleKeyDown(e, index, 'authenticator')}
                                    className="w-12 h-12 text-center border-b-2 border-gray-300 bg-transparent text-2xl font-bold text-gray-900 font-sans focus:border-blue-500 focus:outline-none"
                                    maxLength={1}
                                />
                            ))}
                        </div>

                        <div className="text-center min-h-[24px]">
                            {authOtpError ? (
                                <span className="text-sm text-red-500 font-sans">Authenticator OTP code is incorrect</span>
                            ) : (
                                <>
                                    <span className="text-sm text-gray-500 font-sans">Didn't get a code? </span>
                                    <button type="button" className="text-sm text-blue-600 hover:underline font-sans">
                                        Resend OTP
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Continue Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.2),inset_2px_2px_4px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)] hover:shadow-[inset_-1px_-1px_2px_rgba(255,255,255,0.2),inset_1px_1px_2px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.2)] font-sans mt-4"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div >
    );
} 