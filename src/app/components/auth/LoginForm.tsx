"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatrixAuthService } from "@/lib/matrix-auth"
import { motion } from "framer-motion"

type LoginMethod = "username" | "email" | "phone"

export default function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [loginMethod, setLoginMethod] = useState<LoginMethod>("username")
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    })
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const authService = new MatrixAuthService()
            let response

            switch (loginMethod) {
                case "username":
                    response = await authService.login(formData.username, formData.password)
                    break
                case "email":
                    response = await authService.loginWithEmail(formData.email, formData.password)
                    break
                case "phone":
                    response = await authService.loginWithPhone(formData.phone, formData.password)
                    break
            }

            // Lưu token và thông tin người dùng
            localStorage.setItem("matrix_token", response.access_token)
            localStorage.setItem("matrix_user_id", response.user_id)

            // Chuyển hướng đến trang chủ
            router.push("/")
        } catch (error) {
            console.error("Login failed:", error)
            setError("Invalid credentials. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md space-y-8 bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl"
        >
            <div className="text-center space-y-2">
                <motion.h2
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                    Welcome Back!
                </motion.h2>
                <p className="text-sm text-gray-600">
                    We're excited to see you again!
                </p>
            </div>

            <div className="flex justify-center space-x-4 p-2 bg-gray-50 rounded-lg">
                <Button
                    variant={loginMethod === "username" ? "default" : "ghost"}
                    onClick={() => setLoginMethod("username")}
                    className="transition-all duration-200"
                >
                    Username
                </Button>
                <Button
                    variant={loginMethod === "email" ? "default" : "ghost"}
                    onClick={() => setLoginMethod("email")}
                    className="transition-all duration-200"
                >
                    Email
                </Button>
                <Button
                    variant={loginMethod === "phone" ? "default" : "ghost"}
                    onClick={() => setLoginMethod("phone")}
                    className="transition-all duration-200"
                >
                    Phone
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {loginMethod === "username" && (
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="johndoe"
                            />
                        </div>
                    )}

                    {loginMethod === "email" && (
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="john@example.com"
                            />
                        </div>
                    )}

                    {loginMethod === "phone" && (
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Phone Number
                            </label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="+84 123 456 789"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="••••••••"
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

                <div className="flex items-center justify-between text-sm">
                    <Link
                        href="/forgot-password"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        Forgot your password?
                    </Link>
                    <Link
                        href="/register"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    >
                        Create account
                    </Link>
                </div>

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
                            Signing in...
                        </span>
                    ) : (
                        "Sign in"
                    )}
                </Button>
            </form>
        </motion.div>
    )
} 