import { NextRequest, NextResponse } from "next/server";

// TODO: implement BFF auth proxy per ADR-007
// - Read HttpOnly refresh cookie; attempt silent token refresh on expiry
// - Redirect unauthenticated requests to /login for protected routes
// - Add CSRF double-submit token validation for state-mutating API routes
// - Public routes: /, /products/*, /api/auth/login, /api/auth/refresh, /.well-known/*

export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
