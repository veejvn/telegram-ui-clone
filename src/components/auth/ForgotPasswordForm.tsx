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

interface ForgotPasswordFormProps {
    onEmailSubmit: (email: string) => void;
}

export function ForgotPasswordForm({ onEmailSubmit }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Notification",
                description: "Simulating email sending. Moving to verification step.",
            });
            onEmailSubmit(email);
        }, 1000);
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
                        Forgot Password
                    </CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Enter your email address and we'll send you a verification code to
                        reset your password.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-2">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send Code"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                            onClick={() => (window.location.href = "/login")}
                            disabled={isLoading}
                        >
                            Back to Login
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
} 