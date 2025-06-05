"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff } from 'lucide-react'
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";

// Import MatrixAuthService trực tiếp từ lib/matrix
import { MatrixAuthService } from "@/services/matrix-auth";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<ErrorMessageValue>(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR);
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR);

    // Validate input
    if (!formData.username.trim()) {
      setError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      setIsLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
      setIsLoading(false);
      return;
    }

    try {
      const authService = new MatrixAuthService();
      const response = await authService.login(
        formData.username,
        formData.password
      );

      localStorage.setItem("matrix_token", response.access_token);
      localStorage.setItem("matrix_user_id", response.user_id);
      router.push("/");
    } catch (error: any) {
      let errorMessage: ErrorMessageValue = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

      if (error?.errcode === "M_FORBIDDEN" || error?.message?.includes("Invalid username/password")) {
        errorMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      } else if (error?.errcode === "M_USER_DEACTIVATED") {
        errorMessage = ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      } else if (error?.errcode === "M_LIMIT_EXCEEDED") {
        errorMessage = ERROR_MESSAGES.NETWORK.TIMEOUT;
      } else if (error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError")) {
        errorMessage = ERROR_MESSAGES.NETWORK.CONNECTION_ERROR;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR);
  };

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
        <p className="text-sm text-gray-600">We're excited to see you again!</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6" noValidate>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="off"
              value={formData.username}
              onChange={handleChange}
              onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
              onInput={e => e.currentTarget.setCustomValidity('')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="johndoe"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="off"
                value={formData.password}
                onChange={handleChange}
                onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
                onInput={e => e.currentTarget.setCustomValidity('')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
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
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
