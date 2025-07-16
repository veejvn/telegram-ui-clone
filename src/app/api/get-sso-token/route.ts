// chat-app/src/app/api/session/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookie = await cookies();
        const ssoToken = cookie.get("ssoToken")?.value;
        
        // ✅ Validation: Kiểm tra tất cả thông tin cần thiết
        if (!ssoToken) {
            return NextResponse.json({ 
                error: "Unauthorized", 
                message: "Missing required authentication data" 
            }, { status: 401 });
        }

        // ✅ Trả về dữ liệu đã được validate
        return NextResponse.json({ 
           ssoToken
        });
    } catch (error) {
        console.error("Session API error:", error);
        return NextResponse.json({ 
            error: "Internal Server Error",
            message: "Failed to retrieve session data"
        }, { status: 500 });
    }
}
