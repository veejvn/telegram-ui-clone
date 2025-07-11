// src/app/api/set-cookie/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token, userId, deviceId } = await req.json();

//   if (!token || !userId) {
//     return NextResponse.json({ error: "Missing token or userId" }, { status: 400 });
//   }

  const response = NextResponse.json({ success: true });
  if(token){
    response.cookies.set("matrix_token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
    });
  }
  if(userId){
    response.cookies.set("matrix_user_id", userId, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 604800,
    });
  }
  if (deviceId) {
    response.cookies.set("matrix_device_id", deviceId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 604800,
    });
  }

  return response;
}