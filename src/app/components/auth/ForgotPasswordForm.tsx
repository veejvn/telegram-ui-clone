"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatrixAuthService } from "@/lib/matrix-auth"
import { motion } from "framer-motion"

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const authService = new MatrixAuthService()
            const response = await authService.forgotPassword(email)

            if (response.sid) {
                setIsSubmitted(true)
            } else {
                setError("Failed to send reset email. Please try again.")
            }
        } catch (error: any) {
            console.error("Failed to send reset email:", error)
            setError(error.message || "Failed to send reset email. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
            >
                <div className="text-center space-y-2">
                    <motion.h2
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Check your email
                    </motion.h2>
                    <p className="text-sm text-gray-600">
                        We have sent a password reset link to {email}
                    </p>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">
                        Didn't receive the email? Check your spam folder or{" "}
                        <button
                            onClick={() => setIsSubmitted(false)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                            try again
                        </button>
                    </p>
                    <Link
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 block text-center"
                    >
                        Back to login
                    </Link>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8 bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
        >
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                    Forgot your password?
                </motion.h2>
                <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password
                </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="john@example.com"
                        />
                    </div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-red-500 text-center bg-red-50 p-3 rounded-lg"
                    >
                        {error}
                    </motion.div>
                )}

                <Button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending reset link...
                        </span>
                    ) : (
                        "Send reset link"
                    )}
                </Button>

                <div className="text-center">
                    <Link
                        href="/auth/login"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        Back to login
                    </Link>
                </div>
            </form>
        </motion.div>
    )
} 