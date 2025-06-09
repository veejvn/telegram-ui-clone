import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLS } from '@/tools/localStorage.tool';

export const useAuthProtection = () => {
    const router = useRouter();

    useEffect(() => {
        // Kiểm tra token trong localStorage
        const token = getLS('access_token');

        // Nếu không có token, chuyển hướng đến trang login
        if (!token) {
            router.push('/login');
        }
    }, [router]); // Dependency array bao gồm router để hook chạy lại nếu router thay đổi
}; 