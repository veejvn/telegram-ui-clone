"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";

// Import MatrixAuthService trực tiếp từ lib/matrix
import { MatrixAuthService } from "@/services/matrix-auth";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState<ErrorMessageValue>(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR);

    // Validate input
    if (!formData.username.trim()) {
      setError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD)
      setIsLoading(false)
      return
    }
    if (!formData.email.trim()) {
      setError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD)
      setIsLoading(false)
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError(ERROR_MESSAGES.VALIDATION.INVALID_FORMAT)
      setIsLoading(false)
      return
    }
    if (!formData.password.trim()) {
      setError(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH)
      setIsLoading(false)
      return
    }
    if (/[^a-zA-Z0-9_\-.]/.test(formData.username)) {
      setError(ERROR_MESSAGES.VALIDATION.INVALID_FORMAT)
      setIsLoading(false);
      return;
    }

    try {
      const authService = new MatrixAuthService();
      const response = await authService.register(
        formData.username,
        formData.password,
        formData.email
      );

      localStorage.setItem("matrix_token", response.access_token);
      localStorage.setItem("matrix_user_id", response.user_id);
      router.push(`/ (auth)/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      let errorMessage = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

      if (error?.errcode === "M_USER_IN_USE") {
        errorMessage = ERROR_MESSAGES.AUTH.EMAIL_EXISTS;
      } else if (error?.errcode === "M_INVALID_USERNAME") {
        errorMessage = ERROR_MESSAGES.VALIDATION.INVALID_FORMAT;
      } else if (error?.errcode === "M_EXCLUSIVE") {
        errorMessage = ERROR_MESSAGES.AUTH.EMAIL_EXISTS;
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
  };

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
          Create an account
        </motion.h2>
        <p className="text-sm text-gray-600">
          Join us and start chatting with friends!
        </p>
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
              onInput={e => e.currentTarget.setCustomValidity('')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              autoComplete="off"
              value={formData.phone}
              onChange={handleChange}
              onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
              onInput={e => e.currentTarget.setCustomValidity('')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="0123456789"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="off"
              value={formData.password}
              onChange={handleChange}
              onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
              onInput={e => e.currentTarget.setCustomValidity('')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="off"
              value={formData.confirmPassword}
              onChange={handleChange}
              onInvalid={e => e.currentTarget.setCustomValidity('Please fill out this field.')}
              onInput={e => e.currentTarget.setCustomValidity('')}
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
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
