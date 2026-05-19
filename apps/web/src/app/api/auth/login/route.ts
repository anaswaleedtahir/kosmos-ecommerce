import { NextRequest, NextResponse } from "next/server";

// TODO: proxy POST /api/v1/auth/login to iam-service
// On success: set HttpOnly refresh token cookie, return access token metadata
// On failure: return 401 with { detail: "..." }
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { detail: "Auth not implemented yet." },
    { status: 501 }
  );
}
