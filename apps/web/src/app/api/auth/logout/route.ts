import { NextRequest, NextResponse } from "next/server";

const IAM = process.env.IAM_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const csrfCookie = req.cookies.get("csrfToken")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");
  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return NextResponse.json({ detail: "Invalid CSRF token." }, { status: 403 });
  }

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
    // Best-effort — always clear the local cookie regardless.
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("refresh_token");
  return res;
}
