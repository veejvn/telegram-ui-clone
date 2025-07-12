// chat-app/src/app/api/session/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookie = await cookies();
        const accessToken = cookie.get("matrix_token")?.value;
        const userId = cookie.get("matrix_user_id")?.value;
        const deviceId = cookie.get("matrix_device_id")?.value;
        const backUrl = cookie.get("backUrl")?.value;
        const hide = cookie.get("hide")?.value;
        const ssoToken = cookie.get("ssoToken")?.value;
        
        // ✅ Validation: Kiểm tra tất cả thông tin cần thiết
        if (!accessToken || !userId || !deviceId) {
            return NextResponse.json({ 
                error: "Unauthorized", 
                message: "Missing required authentication data" 
            }, { status: 401 });
        }

        // ✅ Trả về dữ liệu đã được validate
        return NextResponse.json({ 
            accessToken, 
            userId, 
            deviceId, 
            backUrl, 
            hide 
        });
    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            message: "Failed to retrieve session data"
        }, { status: 500 });
    }
}
