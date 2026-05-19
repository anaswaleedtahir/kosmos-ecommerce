import { NextRequest, NextResponse } from "next/server";

// TODO: proxy to iam-service POST /api/v1/auth/logout, then clear the HttpOnly refresh cookie
export async function POST(_req: NextRequest) {
  const response = NextResponse.json(
    { detail: "Auth not implemented yet." },
    { status: 501 }
  );
  return response;
}
