"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import loginSchema from "@/validations/loginSchema";
import { MatrixAuthService } from "@/services/matrixAuthService";
import type { LoginFormData, LoginFormProps } from "@/types/auth";
import { ErrorMessage, Field, Form, SubmitButton } from "@/components/Form";
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const authService = new MatrixAuthService();
      const { success, token, userId, deviceId } = await authService.login(data);
      if (success && token) {
        onSuccess(token, userId, deviceId);
      }
    } catch (error: any) {
      let errorMessage: string = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

      if (
        error?.errcode === "M_FORBIDDEN" ||
        error?.message?.includes("Invalid username/password")
      ) {
        errorMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      } else if (error?.errcode === "M_USER_DEACTIVATED") {
        errorMessage = ERROR_MESSAGES.AUTH.UNAUTHORIZED;
      } else if (error?.errcode === "M_LIMIT_EXCEEDED") {
        errorMessage = ERROR_MESSAGES.NETWORK.TIMEOUT;
      } else if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")
      ) {
        errorMessage = ERROR_MESSAGES.NETWORK.CONNECTION_ERROR;
      }

      setError(errorMessage);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md space-y-8 bg-white/50 backdrop-blur-lg p-8 rounded-2xl shadow-xl dark:bg-gray-800/50 dark:backdrop-blur-lg"
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

      <Form<LoginFormData> schema={loginSchema} onSubmit={handleSubmit}>
        <Field
          name="username"
          label="Username"
          type="text"
          placeholder="johndoe"
        />
        <Field
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
        />
        <ErrorMessage message={error}></ErrorMessage>
        <div className="flex items-center justify-between text-sm my-5">
          <Link href="/register" className="text-blue-600 hover:text-blue-800">
            Create account
          </Link>
        </div>
        <SubmitButton>Sign In</SubmitButton>
      </Form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
        <span className="mx-2 text-gray-500 text-sm">HOẶC</span>
        <div className="flex-grow h-px bg-gray-300 dark:bg-gray-600" />
      </div>

      {/* SSO/Provider Button */}
      <div className="space-y-3">
        <button
          className="w-full flex items-center justify-center py-2 px-4 rounded-full border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition font-medium"
          onClick={() => {
            window.location.href = "https://matrix.teknix.dev/_matrix/client/r0/login/sso/redirect?redirectUrl=" + encodeURIComponent(window.location.origin);
          }}
        >
          Đăng nhập với SSO (Keycloak)
        </button>
      </div>
    </motion.div>
  );
}
