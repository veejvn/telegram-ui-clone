"use client";

import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { checkTokenValidity } from "@/lib/matrix";
import { useAuthStore } from '@/stores/useAuthStore';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose?: () => void;
}

export default function Toast({
    message,
    type,
    duration = 3000,
    onClose
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);
    const { toast } = useToast();
    const accessToken = useAuthStore((state) => state.accessToken)
    const userId = useAuthStore((state) => state.userId)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await checkTokenValidity(accessToken || "", userId || "");
            if (!isValid) {
                toast({
                    title: "Phiên đăng nhập hết hạn",
                    description: "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
                    variant: "destructive",
                });
            }
        };

        // Kiểm tra token mỗi 5 phút
        const interval = setInterval(checkToken, 5 * 60 * 1000);

        // Kiểm tra ngay lập tức
        checkToken();

        return () => clearInterval(interval);
    }, [toast]);

    const typeClasses = {
        success: 'bg-green-50 text-green-800 border-green-200',
        error: 'bg-red-50 text-red-800 border-red-200',
        info: 'bg-blue-50 text-blue-800 border-blue-200',
        warning: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    };

    const iconClasses = {
        success: 'text-green-400',
        error: 'text-red-400',
        info: 'text-blue-400',
        warning: 'text-yellow-400'
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 animate-fade-in-up`}>
            <div className={`rounded-lg border p-4 shadow-lg ${typeClasses[type]}`}>
                <div className="flex items-center">
                    <div className={`flex-shrink-0 ${iconClasses[type]}`}>
                        {type === 'success' && (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                        {type === 'error' && (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        {type === 'info' && (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        )}
                        {type === 'warning' && (
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    <div className="ml-auto pl-3">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                onClose?.();
                            }}
                            className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TokenExpirationToast() {
    const { toast } = useToast();
    const accessToken = useAuthStore((state) => state.accessToken)
    const userId = useAuthStore((state) => state.userId)

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await checkTokenValidity(accessToken || "", userId || "");
            if (!isValid) {
                toast({
                    title: "Phiên đăng nhập hết hạn",
                    description: "Vui lòng đăng nhập lại để tiếp tục sử dụng.",
                    variant: "destructive",
                });
            }
        };

        // Kiểm tra token mỗi 5 phút
        const interval = setInterval(checkToken, 5 * 60 * 1000);

        // Kiểm tra ngay lập tức
        checkToken();

        return () => clearInterval(interval);
    }, [toast]);

    return null;
} 