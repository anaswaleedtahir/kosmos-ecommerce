import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

const PROTECTED = ["/checkout"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect unauthenticated visitors away from protected routes
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (!req.cookies.has("refresh_token")) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();

  // Issue CSRF token cookie if absent — intentionally not HttpOnly so client JS can read it
  if (!req.cookies.has("csrfToken")) {
    res.cookies.set("csrfToken", randomUUID(), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
