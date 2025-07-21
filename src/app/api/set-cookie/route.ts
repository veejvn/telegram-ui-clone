// src/app/api/set-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, userId, deviceId } = await req.json();

  //   if (!token || !userId) {
  //     return NextResponse.json({ error: "Missing token or userId" }, { status: 400 });
  //   }
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_ENV === "production";
  // console.log("NODE_ENV:", process.env.NODE_ENV);
  // console.log("NEXT_PUBLIC_ENV:", process.env.NEXT_PUBLIC_ENV);
  // console.log("isProduction:", isProduction);

  const response = NextResponse.json({ success: true });
  if (token) {
    response.cookies.set("matrix_token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }
  if (userId) {
    response.cookies.set("matrix_user_id", userId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }
  if (deviceId) {
    response.cookies.set("matrix_device_id", deviceId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  }

  return response;
}
