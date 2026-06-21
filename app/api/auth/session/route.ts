import { NextResponse } from "next/server";

import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const accessToken =
    body && typeof body.access_token === "string" ? body.access_token : null;

  if (!accessToken) {
    return NextResponse.json({ detail: "Missing access_token" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
