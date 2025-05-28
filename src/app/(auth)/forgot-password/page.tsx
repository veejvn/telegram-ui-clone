"use client"

import { useState } from 'react';
import Image from 'next/image';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { VerificationCodeForm } from '../../components/auth/VerificationCodeForm';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { useRouter } from 'next/navigation';

enum ForgotPasswordStep {
    EnterEmail,
    EnterCode,
    ResetPassword,
}

export default function ForgotPasswordPage() {
    const [currentStep, setCurrentStep] = useState(ForgotPasswordStep.EnterEmail);
    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleEmailSubmit = (submittedEmail: string) => {
        setEmail(submittedEmail);
        setCurrentStep(ForgotPasswordStep.EnterCode);
    };

    const handleVerificationSuccess = () => {
        setCurrentStep(ForgotPasswordStep.ResetPassword);
    };

    const handlePasswordResetSuccess = () => {
        router.push('/login');
    };

    const renderStep = () => {
        switch (currentStep) {
            case ForgotPasswordStep.EnterEmail:
                return <ForgotPasswordForm onEmailSubmit={handleEmailSubmit} />;
            case ForgotPasswordStep.EnterCode:
                return <VerificationCodeForm email={email} onSuccess={handleVerificationSuccess} onBack={() => setCurrentStep(ForgotPasswordStep.EnterEmail)} />;
            case ForgotPasswordStep.ResetPassword:
                return <ResetPasswordForm onSuccess={handlePasswordResetSuccess} onBack={() => setCurrentStep(ForgotPasswordStep.EnterCode)} />;
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
                    />
                </div>
                {renderStep()}
            </div>
        </div>
    );
} 