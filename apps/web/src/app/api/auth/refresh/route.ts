import { NextRequest, NextResponse } from "next/server";

import { forwardSetCookie } from "@/lib/set-cookie";

const IAM = process.env.IAM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const csrfCookie = req.cookies.get("csrfToken")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return NextResponse.json({ detail: "Invalid CSRF token." }, { status: 403 });
  }

  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token." }, { status: 401 });
  }

  const upstream = await fetch(`${IAM}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });

  if (!upstream.ok) {
    const res = NextResponse.json({ detail: "Session expired." }, { status: 401 });
    res.cookies.delete("refresh_token");
    return res;
  }

  const res = NextResponse.json({ ok: true });
  forwardSetCookie(upstream, res);
  return res;
}
