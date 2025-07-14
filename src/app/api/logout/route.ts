// chat-app/src/app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' })
  const isProduction = process.env.NODE_ENV === "production";

  ['matrix_token', 'matrix_user_id', 'matrix_device_id'].forEach((name) => {
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
  });

  return response
}
