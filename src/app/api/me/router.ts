// app/api/me/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies(); // <-- thêm await
    const userCookie = cookieStore.get("matrix_user");

    if (!userCookie) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));

        return NextResponse.json({
            displayName: user.displayName || "Unknown",
            status: user.status || "offline",
            phone: user.phone || null,
            avatarUrl: user.avatarUrl || null,
        });
    } catch (e) {
        return NextResponse.json({ error: "Invalid user cookie" }, { status: 400 });
    }
}
