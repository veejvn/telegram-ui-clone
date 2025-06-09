"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ERROR_MESSAGES, ErrorMessageValue } from "@/constants/error-messages";
import { MatrixAuthService } from "@/services/matrix-auth";
import { ErrorMessage, Field, Form, SubmitButton } from "@/components/Form";
import registerSchema from "@/validations/registerSchema";
import { RegisterFormData } from "@/types/auth";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      const authService = new MatrixAuthService();
      const response = await authService.register(data);
      if (response?.access_token) {
        router.push("/chat");
      }
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
    }
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
        <ErrorMessage message={error}></ErrorMessage>
        <SubmitButton loadingText="Creating account...">Create account</SubmitButton>
      </Form>
    </motion.div>
  );
}
