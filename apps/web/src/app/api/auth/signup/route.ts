import { NextRequest, NextResponse } from "next/server";

import { forwardSetCookie } from "@/lib/set-cookie";

const IAM = process.env.IAM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const csrfCookie = req.cookies.get("csrfToken")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return NextResponse.json({ detail: "Invalid CSRF token." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const upstream = await fetch(`${IAM}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const loginUpstream = await fetch(`${IAM}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: body.username, password: body.password }),
    });

    const res = NextResponse.json({ ok: true }, { status: 201 });
    if (loginUpstream.ok) forwardSetCookie(loginUpstream, res);
    return res;
  } catch {
    return NextResponse.json({ detail: "Auth service unavailable." }, { status: 503 });
  }
}
