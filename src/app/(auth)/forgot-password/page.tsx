"use client";

import { useState } from "react";
import Image from "next/image";

import { useRouter } from "next/navigation";
import { MatrixAuthService } from "@/services/matrixAuthService";

enum ForgotPasswordStep {
  EnterEmail,
  EnterCode,
  ResetPassword,
}

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(ForgotPasswordStep.EnterEmail);
  const [email, setEmail] = useState("");
  const [sid, setSid] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string | null>(null);
  const router = useRouter();

  const handleEmailSubmit = async (submittedEmail: string) => {
    // Gọi API gửi email OTP
    try {
      const matrixAuth = new MatrixAuthService();
      const result = await matrixAuth.forgotPassword(submittedEmail);
      setEmail(submittedEmail);
      setSid(result.sid);
      setClientSecret(result.client_secret);
      setCurrentStep(ForgotPasswordStep.EnterCode);
    } catch (error) {
      // Có thể show toast ở đây nếu muốn
    }
  };

  const handleVerificationSuccess = (code: string) => {
    setOtpCode(code);
    setCurrentStep(ForgotPasswordStep.ResetPassword);
  };

  const handlePasswordResetSuccess = () => {
    router.push("/login");
  };

  const renderStep = () => {
    switch (currentStep) {
      case ForgotPasswordStep.EnterEmail:
        return <ForgotPasswordForm onEmailSubmit={handleEmailSubmit} />;
      case ForgotPasswordStep.EnterCode:
        return (
          <VerificationCodeForm
            email={email}
            onSuccess={handleVerificationSuccess}
            onBack={() => setCurrentStep(ForgotPasswordStep.EnterEmail)}
          />
        );
      case ForgotPasswordStep.ResetPassword:
        return (
          <ResetPasswordForm
            email={email}
            sid={sid}
            clientSecret={clientSecret}
            otpCode={otpCode}
            onSuccess={handlePasswordResetSuccess}
            onBack={() => setCurrentStep(ForgotPasswordStep.EnterCode)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative w-full max-w-md px-4 py-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="rounded-xl"
            loading="eager"
            priority
          />
        </div>
        {renderStep()}
      </div>
    </div>
  );
}
