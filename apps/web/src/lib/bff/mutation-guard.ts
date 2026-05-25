import "server-only";

import { NextRequest, NextResponse } from "next/server";

export function validateBffMutation(req: NextRequest): NextResponse | null {
  const csrfCookie = req.cookies.get("csrfToken")?.value;
  const csrfHeader = req.headers.get("x-csrf-token");

  if (!csrfCookie || csrfCookie !== csrfHeader) {
    return NextResponse.json({ detail: "Invalid CSRF token." }, { status: 403 });
  }

  return null;
}
