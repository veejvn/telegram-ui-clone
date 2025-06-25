"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your@email.com";
  // const sid = searchParams.get('sid');
  // const { registrationData, clearRegistrationData } = useRegistrationStore();

  // console.log("Registration Data:", registrationData);
  // console.log("SID:", sid);

  // useEffect(() => {
  //     const completeRegistration = async () => {
  //         try {
  //             if (!sid || !registrationData?.client_secret) {
  //                 router.push('/register?error=invalid_verification');
  //                 return;
  //             }

  //             const authService = new MatrixAuthService();
  //             await authService.register({
  //                 username: registrationData.username,
  //                 password: registrationData.password,
  //                 sid,
  //                 client_secret: registrationData.client_secret
  //             });
  //             clearRegistrationData();
  //             router.push('/chat');
  //             console.log('Registration completed successfully');
  //         } catch (error) {
  //             console.error('Registration completion failed:', error);
  //             router.push('/register?error=registration_failed');
  //         }
  //     };

  //     if (sid && registrationData) {
  //         completeRegistration();
  //     }
  // }, [sid, registrationData, router, clearRegistrationData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 sm:px-0">
      <div className="mb-6 mt-2 flex flex-col items-center">
        <span className="text-6xl" role="img" aria-label="email">
          📧
        </span>
      </div>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-black mb-2 text-center tracking-tight">
        Check Your Email
      </h2>
      <p className="text-gray-500 mb-2 text-center text-base sm:text-base font-medium">
        Please enter the code we have sent to your email
      </p>
      <div className="mb-8 text-center">
        <span className="text-blue-600 font-bold text-base sm:text-lg break-all">
          {email}
        </span>
      </div>
      <div className="flex gap-2 sm:gap-4 mb-10">
        {otp.map((digit, idx) => (
          <Input
            key={idx}
            ref={(el) => {
              inputs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`w-10 h-10 sm:w-14 sm:h-14 text-xl sm:text-2xl text-center rounded-2xl border-2 bg-white text-black font-bold shadow-md transition-all duration-150 outline-none focus:border-blue-500 ${
              digit ? "border-blue-500" : "border-gray-300"
            }`}
            style={{
              boxShadow: digit ? "0 0 12px #3b82f655" : "0 0 8px #e5e7eb",
            }}
          />
        ))}
      </div>
      <button className="bg-blue-600 text-white px-6 py-2 sm:px-10 sm:py-3 rounded-xl text-base sm:text-lg font-semibold shadow-lg hover:bg-blue-700 transition-all w-full max-w-xs">
        Verify
      </button>
    </div>
  );
}
