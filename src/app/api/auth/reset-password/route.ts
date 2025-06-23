import { NextResponse } from 'next/server';

// Matrix homeserver URL - replace with your homeserver
const HOMESERVER_URL = "https://matrix.org";

export async function POST(request: Request) {
    try {
        const { newPassword, token } = await request.json();

        if (!newPassword || !token) {
            return NextResponse.json(
                { error: 'New password and token are required' },
                { status: 400 }
            );
        }

        // Chuyển logic gọi API từ client sang server
        // Dựa trên cách triển khai cũ sử dụng token, ta sẽ mô phỏng lại cuộc gọi API Matrix
        // Endpoint và cấu trúc body có thể cần điều chỉnh dựa trên tài liệu Matrix IAAPI
        // Standard Matrix password reset involves Interactive Authentication, typically client-driven.
        // This server-side call is an approximation based on the previous client code.

        // Example fetch call (may need adjustment based on specific homeserver IAAPI implementation):
        const response = await fetch(`${HOMESERVER_URL}/_matrix/client/v3/account/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            // Cấu trúc body cho IAAPI xác thực bằng token
            body: JSON.stringify({
                auth: {
                    type: "m.login.token", // Loại xác thực dùng token
                    token: token, // Token nhận được qua email
                },
                new_password: newPassword, // Mật khẩu mới
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data.error || data.errcode || 'Failed to reset password';
            // Handle specific Matrix errors if needed (e.g., M_UNKNOWN, M_MISSING_PARAM)
            throw new Error(errorMsg);
        }

        return NextResponse.json(
            { message: 'Password has been reset successfully' },
            { status: response.status }
        );

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to reset password' },
            { status: error.message.includes('required') ? 400 : 500 }
        );
    }
} 