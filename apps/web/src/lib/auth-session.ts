import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { forwardSetCookie } from "@/lib/set-cookie";

const IAM = process.env.IAM_SERVICE_URL ?? "http://localhost:8000";

async function readJson(upstream: Response): Promise<unknown> {
  return upstream.json().catch(() => ({}));
}

function authUnavailable(): NextResponse {
  return NextResponse.json({ detail: "Auth service unavailable." }, { status: 503 });
}

export async function loginSession(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const upstream = await fetch(`${IAM}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await readJson(upstream);
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const res = NextResponse.json({ ok: true });
    forwardSetCookie(upstream, res);
    return res;
  } catch {
    return authUnavailable();
  }
}

export async function signupSession(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const upstream = await fetch(`${IAM}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await readJson(upstream);
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const loginUpstream = await fetch(`${IAM}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password }),
    });

    const res = NextResponse.json({ ok: true }, { status: 201 });
    if (loginUpstream.ok) forwardSetCookie(loginUpstream, res);
    return res;
  } catch {
    return authUnavailable();
  }
}

export async function refreshSession(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ detail: "No refresh token." }, { status: 401 });
  }

  try {
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
  } catch {
    return authUnavailable();
  }
}

export async function logoutSession(req: NextRequest): Promise<NextResponse> {
  const refreshToken = req.cookies.get("refresh_token")?.value ?? "";
  try {
    await fetch(`${IAM}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });
  } catch {
    // Best-effort: always clear the local cookie regardless.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("refresh_token");
  return res;
}
