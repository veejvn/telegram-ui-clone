"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import loginSchema from "@/validations/loginSchema";
import { MatrixAuthService } from "@/services/matrixAuthService";
import type { LoginFormData, LoginFormProps } from "@/types/auth";
import { ErrorMessage, Field, Form, SubmitButton } from "@/components/Form";
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";
import ServerStatus from "@/components/auth/ServerStatus";

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [error, setError] = useState("");
  const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL || "";

  const handleSubmit = async (data: LoginFormData) => {
    setError(""); // Clear previous errors

    try {
      const authService = new MatrixAuthService();
      const result = await authService.login(data);

      //console.log("Login response:", result);

      if (result.success && result.token && result.userId && result.deviceId) {
        //console.log("🎉 Login successful, calling onSuccess...");
        onSuccess(result.token, result.userId, result.deviceId);
      } else {
        throw new Error("Login failed: Missing required data in response");
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
      } else if (error?.message) {
        // Show actual error for debugging
        errorMessage = `Error: ${error.message}`;
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
        {/* Server Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Server:</span>{" "}
              {HOMESERVER_URL.replace("https://", "")}
            </p>
            <ServerStatus />
          </div>
        </div>
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

        {/* Better error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <div className="text-sm font-medium">❌ Đăng nhập thất bại</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        )}

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
            const redirectUrl = `${
              process.env.NEXT_PUBLIC_MATRIX_BASE_URL
            }/_matrix/client/r0/login/sso/redirect?redirectUrl=${encodeURIComponent(
              window.location.origin
            )}/chat`;
            window.location.href = redirectUrl;
          }}
        >
          Đăng nhập với SSO (Keycloak)
        </button>
      </div>
    </motion.div>
  );
}
