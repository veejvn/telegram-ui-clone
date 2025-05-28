"use client"

import ForgotPasswordForm from "@/app/components/auth/ForgotPasswordForm"
import Image from 'next/image'

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="relative w-full max-w-md px-4 py-8">
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={48}
                        height={48}
                        className="rounded-xl"
                    />
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    )
} 