"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
// import { matrixAuth } from '@/lib/matrix-auth'; // Tạm thời ẩn import matrixAuth
// import { VerificationCodeForm } from '../../app/components/auth/VerificationCodeForm'; // Ẩn import cũ
// import { VerificationCodeForm } from './VerificationCodeForm'; // Import VerificationCodeForm từ vị trí đúng

interface ForgotPasswordFormProps {
    onEmailSubmit: (email: string) => void; // Add new prop
}

export function ForgotPasswordForm({ onEmailSubmit }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const [showVerification, setShowVerification] = useState(false); // Remove state, parent handles this
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mô phỏng việc gửi email và sau đó hiển thị form xác thực cho mục đích phát triển UI
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Thông báo",
                description: "Đang mô phỏng gửi email. Chuyển sang bước xác thực.",
            });
            onEmailSubmit(email); // Call the prop here
        }, 1000);

        // Logic gốc (đã ẩn để tập trung vào UI)
        // try {
        //     await matrixAuth.requestPasswordRecovery(email);
        //     toast({
        //         title: "Thành công",
        //         description: "Mã xác thực đã được gửi đến email của bạn.",
        //     });
        //     onEmailSubmit(email); // Call prop on success
        // } catch (error) {
        //     console.error("Gửi mã xác thực thất bại:", error);
        //     toast({
        //         title: "Lỗi",
        //         description: "Gửi mã xác thực thất bại. Vui lòng thử lại.",
        //         variant: "destructive",
        //     });
        // } finally {
        //     setIsLoading(false);
        // }
    };

    // Remove handleVerificationSuccess and conditional rendering, parent handles this

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-[400px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">Quên mật khẩu</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một mã xác thực để đặt lại mật khẩu.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Nhập email của bạn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            {isLoading ? "Đang gửi..." : "Gửi mã xác thực"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                            onClick={() => window.location.href = '/login'}
                            disabled={isLoading} // Disable button while loading
                        >
                            Quay lại Đăng nhập
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
} 