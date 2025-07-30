"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ROUTES } from "@/constants/routes";
import { callService } from "@/services/callService";
import { MatrixAuthService } from "@/services/matrixAuthService";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { FaApple, FaGoogle, FaTelegramPlane } from "react-icons/fa";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import loginSchema from "@/validations/loginSchema";
import { ErrorMessage, Field, Form, SubmitButton } from "@/components/Form";
import type { LoginFormData } from "@/types/auth";
import { BiQrScan } from "react-icons/bi";

export default function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const { accessToken, userId, deviceId } = useAuthStore();

  // UI states
  const [selectedTab, setSelectedTab] = useState("Biometrics");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricError, setBiometricError] = useState("");

  useEffect(() => {
    if (accessToken && userId && deviceId) {
      callService.reinitialize("");
    }
  }, [accessToken, userId, deviceId]);

  // Check if account is locked (after 5 failed attempts)
  useEffect(() => {
    if (loginAttempts >= 5) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
      }, 300000); // 5 minutes lockout
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleSuccess = (token: string, userId: string, deviceId: string) => {
    login(token, userId, deviceId);
    setError("");
    setLoginAttempts(0);
    setTimeout(() => {
      router.push(ROUTES.CHAT);
    }, 100);
  };

  const handleSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      setError("Account is temporarily locked. Please try again in 5 minutes.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Validate input data
      const { error: validationError } = loginSchema.validate(data);
      if (validationError) {
        throw new Error(validationError.details[0].message);
      }

      // Check for suspicious patterns
      if (data.username.toLowerCase() === data.password.toLowerCase()) {
        throw new Error(ERROR_MESSAGES.VALIDATION.PASSWORD_SAME_AS_USERNAME);
      }

      const authService = new MatrixAuthService();
      const result = await authService.login(data);

      if (result.success && result.token && result.userId && result.deviceId) {
        handleSuccess(result.token, result.userId, result.deviceId);
      } else {
        throw new Error("Login failed: Missing required data in response");
      }
    } catch (error: any) {
      let errorMessage: string = ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR;

      if (error?.message?.includes("validation")) {
        errorMessage = error.message;
      } else if (
        error?.errcode === "M_FORBIDDEN" ||
        error?.message?.includes("Invalid username/password")
      ) {
        errorMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
        setLoginAttempts(prev => prev + 1);
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
        errorMessage = `Error: ${error.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "Password":
        return (
          <form className="w-full flex flex-col gap-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = {
              username: formData.get('username') as string,
              password: formData.get('password') as string
            };
            handleSubmit(data);
          }}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                name="username"
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light"
                disabled={isLoading || isLocked}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm pr-12 placeholder-gray-400 text-gray-900 placeholder:italic placeholder:font-light"
                  disabled={isLoading || isLocked}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading || isLocked}
                >
                  {showPassword
                    ? <EyeIcon className="w-5 h-5 text-gray-400" />
                    : <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-2 border-gray-300 mr-3 text-gray-600 focus:ring-2 focus:ring-gray-300 focus:ring-offset-0 bg-white/30"
                  disabled={isLoading || isLocked}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => {
                  console.log('Forgot Password clicked');
                  console.log('ROUTES.FORGOT_PASSWORD:', ROUTES.FORGOT_PASSWORD);
                  router.push(ROUTES.FORGOT_PASSWORD);
                }}
                className="text-sm text-blue-600 hover:underline"
                disabled={isLoading || isLocked}
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className={`w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base ${isLoading || isLocked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Signing in...' : isLocked ? 'Account Locked' : 'Continue'}
            </button>
          </form>
        );

      case "Biometrics":
        return (
          <div className="w-full flex flex-col items-center">
            {/* Face ID Icon */}
            <div className="w-24 h-24 flex items-center justify-center mb-6">
              <svg className={`w-16 h-16 ${biometricError ? 'text-red-500' : 'text-black'}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Corner brackets with rounded corners */}
                <path d="M2 2h6v2H4v4H2V2z" fill="currentColor" rx="4" ry="4" />
                <path d="M22 2h-6v2h4v4h2V2z" fill="currentColor" rx="4" ry="4" />
                <path d="M2 16h2v4h4v2H2v-6z" fill="currentColor" rx="4" ry="4" />
                <path d="M22 16h-2v4h-4v2h6v-6z" fill="currentColor" rx="4" ry="4" />

                {/* Face features */}
                {/* Eyes - vertical lines */}
                <line x1="8" y1="9" x2="8" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="9" x2="16" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

                {/* Nose - curved line */}
                <path d="M12 10 Q14 12 12 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Mouth - smile */}
                <path d="M8 16 Q12 18 16 16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Error Message */}
            {biometricError && (
              <div className="text-red-500 text-sm font-medium text-center mb-6">
                {biometricError}
              </div>
            )}

            {/* Instructions */}
            <p className="text-sm text-gray-600 text-center mb-6">
              Authenticate securely by scanning the QR code with your trusted device.
            </p>

            {/* Test Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={() => setBiometricError("Please remove your mask and any other objects in front of you.")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
              >
                Test Error
              </button>
              <button
                type="button"
                onClick={() => setBiometricError("")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
              >
                Clear Error
              </button>
            </div>
          </div>
        );

      case "QR Bank":
        return (
          <div className="w-full">
            <div className="bg-gray-100 rounded-lg p-6 flex items-center gap-4">
              {/* QR Code Icon */}
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                <BiQrScan className="w-12 h-12 text-gray-600" />
              </div>

              {/* Description */}
              <div className="flex-1">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Authenticate securely by scanning the QR code with your trusted device.
                </p>
              </div>
            </div>
          </div>
        );

      case "Seedphrase":
        return (
          <div className="w-full flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
              <div className="text-gray-500 text-2xl">🔑</div>
            </div>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter your seed phrase to authenticate securely.
            </p>
            <button
              type="button"
              className="w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition text-base"
            >
              Continue
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-2">
      <div className="bg-white/20 rounded-[32px] min-h-[540px] px-6 py-8 shadow-lg backdrop-blur-[16px] flex flex-col items-center w-full max-w-md">
        {/* Header */}
        <div className="w-full text-center mb-6">
          <p className="text-sm text-gray-900 mb-1 font-bold">Log in</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
          <p className="text-sm text-gray-600">
            New Generation Teknix Account: Safe, Fast and Conveniently Integrated.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex w-full bg-gray-300 rounded-full p-2 mb-6 shadow-md">
          {["Password", "Biometrics", "QR Bank", "Seedphrase"].map((method) => (
            <button
              key={method}
              className={`flex-1 py-3 text-sm font-medium rounded-full transition
                 ${selectedTab === method
                  ? "bg-white/60 shadow-lg text-gray-900 font-semibold"
                  : "text-gray-500"
                }`}
              onClick={() => setSelectedTab(method)}
            >
              {method}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}