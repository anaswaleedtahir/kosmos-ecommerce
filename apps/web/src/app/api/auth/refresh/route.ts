import { NextRequest, NextResponse } from "next/server";

// TODO: read HttpOnly refresh token cookie, proxy to iam-service POST /api/v1/auth/refresh
// On success: rotate cookie, return new access token metadata
// On failure: clear cookie, return 401
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { detail: "Auth not implemented yet." },
    { status: 501 }
  );
}
