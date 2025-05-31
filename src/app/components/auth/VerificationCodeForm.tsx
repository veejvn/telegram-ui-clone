"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
// import { matrixAuth } from '@/lib/matrix-auth'; // Temporarily comment out matrixAuth import

interface VerificationCodeFormProps {
    email: string;
    onSuccess: () => void;
    onBack: () => void;
}

export function VerificationCodeForm({ email, onSuccess, onBack }: VerificationCodeFormProps) {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate verification success for UI demonstration
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Success",
                description: "Verification code accepted (frontend simulation).",
            });
            onSuccess();
        }, 1000);

        // try {
        //   await matrixAuth.verifyRecoveryCode(email, code);
        //   toast({
        //     title: "Success",
        //     description: "Verification code is valid. You can now reset your password.",
        //   });
        //   onSuccess();
        // } catch (error) {
        //   toast({
        //     title: "Error",
        //     description: "Invalid verification code. Please try again.",
        //     variant: "destructive",
        //   });
        // } finally {
        //   setIsLoading(false);
        // }
    };

    const handleResendCode = async () => {
        setIsLoading(true);
        // Simulate resending code
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Success",
                description: "A new verification code has been sent to your email (frontend simulation).",
            });
        }, 1000);
        // try {
        //   await matrixAuth.requestPasswordRecovery(email);
        //   toast({
        //     title: "Success",
        //     description: "A new verification code has been sent to your email.",
        //   });
        // } catch (error) {
        //   toast({
        //     title: "Error",
        //     description: "Failed to send verification code. Please try again.",
        //     variant: "destructive",
        //   });
        // } finally {
        //   setIsLoading(false);
        // }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-[380px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">Verification Code</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        We've sent a verification code to <span className="font-medium text-blue-600">{email}</span>
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-sm font-medium text-gray-700">Verification Code</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Enter 6-digit code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    maxLength={6}
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify Code"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                            onClick={handleResendCode}
                            disabled={isLoading}
                        >
                            Resend Code
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
} 