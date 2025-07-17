"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const HOMESERVER_URL = process.env.NEXT_PUBLIC_MATRIX_BASE_URL ?? "https://matrix.org";

export default function ServerStatus() {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await fetch(`${HOMESERVER_URL}/_matrix/client/versions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    setStatus('online');
                } else {
                    setStatus('offline');
                }
            } catch (error) {
                //console.error('Server status check failed:', error);
                setStatus('offline');
            }
        };

        checkServerStatus();
    }, []);

    const getStatusIcon = () => {
        switch (status) {
            case 'checking':
                return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
            case 'online':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'offline':
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'checking':
                return 'Đang kiểm tra...';
            case 'online':
                return 'Trực tuyến';
            case 'offline':
                return 'Không khả dụng';
        }
    };

    return (
        <div className="flex items-center gap-2 text-xs">
            {getStatusIcon()}
            <span className={`${status === 'online' ? 'text-green-600 dark:text-green-400' :
                    status === 'offline' ? 'text-red-600 dark:text-red-400' :
                        'text-yellow-600 dark:text-yellow-400'
                }`}>
                {getStatusText()}
            </span>
        </div>
    );
} 