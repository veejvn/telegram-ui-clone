"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ResetPasswordFormProps {
    email: string;
    sid: string | null;
    clientSecret: string | null;
    otpCode: string | null;
    onSuccess: () => void;
    onBack: () => void;
}

export function ResetPasswordForm({
    email,
    sid,
    clientSecret,
    otpCode,
    onSuccess,
    onBack,
}: ResetPasswordFormProps) {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        if (!sid || !clientSecret || !otpCode) {
            toast({
                title: "Error",
                description: "Missing verification information.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const matrixAuth = new (await import("@/services/matrixAuthService")).MatrixAuthService();
            await matrixAuth.resetPassword(newPassword, {
                sid,
                client_secret: clientSecret,
                code: otpCode,
                email,
            });
            toast({
                title: "Success",
                description: "Password has been reset. Returning to login page.",
            });
            onSuccess();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error?.message || "Failed to reset password.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-[380px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Enter your new password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="newPassword"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isLoading ? "Resetting..." : "Confirm"}
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