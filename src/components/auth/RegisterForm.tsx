"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { ErrorMessage, Field, Form, SubmitButton } from "@/components/Form";
import registerSchema from "@/validations/registerSchema";
import { RegisterFormData } from "@/types/auth";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "sonner";
import ServerStatus from "./ServerStatus";

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (data: RegisterFormData) => {
    setError("");

    try {
      const authService = new MatrixAuthService();
      const response = await authService.register(data);

      if (response?.success && response?.token && response?.userId) {
        // Show success toast and redirect to login page
        toast.success("Registration successful! Please sign in to continue.", {
          duration: 3000,
        });
        router.push("/login");
        return;
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      let errorMessage = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

      // Handle specific errors
      if (error?.message?.includes("Username has already been taken") || error?.message?.includes("Username is already taken")) {
        errorMessage = ERROR_MESSAGES.AUTH.USERNAME_EXISTS;
      } else if (error?.message?.includes("Invalid username")) {
        errorMessage = ERROR_MESSAGES.AUTH.INVALID_USERNAME;
      } else if (error?.message?.includes("Username must be at least")) {
        errorMessage = error.message;
      } else if (error?.errcode === "M_USER_IN_USE") {
        errorMessage = ERROR_MESSAGES.AUTH.USERNAME_EXISTS;
      } else if (error?.errcode === "M_INVALID_USERNAME") {
        errorMessage = ERROR_MESSAGES.AUTH.INVALID_USERNAME;
      } else if (error?.errcode === "M_EXCLUSIVE") {
        errorMessage = ERROR_MESSAGES.AUTH.USERNAME_EXISTS;
      } else if (error?.errcode === "M_FORBIDDEN") {
        errorMessage = ERROR_MESSAGES.AUTH.REGISTRATION_FAILED;
      } else if (error?.errcode === "M_UNKNOWN") {
        errorMessage = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;
      } else if (
        error?.message?.includes("Failed to fetch") ||
        error?.message?.includes("NetworkError")
      ) {
        errorMessage = ERROR_MESSAGES.NETWORK.CONNECTION_ERROR;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
      });
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
          Create an account
        </motion.h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Join us and start chatting with friends!
        </p>

        {/* Server Info */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">Server:</span> {HOMESERVER_URL.replace('https://', '')}
            </p>
            <ServerStatus />
          </div>
        </div>
      </div>

      <Form<RegisterFormData> schema={registerSchema} onSubmit={handleSubmit}>
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
        <Field
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
        />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>

        <ErrorMessage message={error} />

        <SubmitButton loadingText="Creating account...">
          Create account
        </SubmitButton>
      </Form>
    </motion.div>
  );
}
