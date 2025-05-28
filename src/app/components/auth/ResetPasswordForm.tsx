"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
// import { matrixAuth } from '@/lib/matrix-auth'; // Temporarily comment out matrixAuth import

interface ResetPasswordFormProps {
    // token: string; // We might need a token here later
    onSuccess: () => void;
    onBack: () => void;
}

export function ResetPasswordForm({ onSuccess, onBack }: ResetPasswordFormProps) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Lỗi",
                description: "Mật khẩu xác nhận không khớp.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        // Simulate password reset
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "Thành công",
                description: "Mật khẩu đã được đặt lại (mô phỏng). Quay lại trang đăng nhập.",
            });
            onSuccess(); // Signal success to parent (which will redirect)
        }, 1000);

        // Logic gốc (sẽ bỏ comment khi sẵn sàng)
        // try {
        //     // You'll likely need a token from the verification step
        //     // await matrixAuth.resetPassword(newPassword, token);
        //     toast({
        //         title: "Thành công",
        //         description: "Mật khẩu của bạn đã được đặt lại thành công.",
        //     });
        //     onSuccess(); // Signal success to parent
        // } catch (error) {
        //     console.error("Đặt lại mật khẩu thất bại:", error);
        //     toast({
        //         title: "Lỗi",
        //         description: "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
        //         variant: "destructive",
        //     });
        // } finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-[400px] bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-gray-900">Đặt lại mật khẩu</CardTitle>
                    <CardDescription className="text-center text-gray-600">
                        Nhập mật khẩu mới của bạn.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">Mật khẩu mới</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Nhập mật khẩu mới"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Xác nhận mật khẩu mới</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Xác nhận mật khẩu mới"
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
                            {isLoading ? "Đang đặt lại..." : "Đồng ý"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full h-11 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors"
                            onClick={onBack}
                            disabled={isLoading}
                        >
                            Quay lại
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
}