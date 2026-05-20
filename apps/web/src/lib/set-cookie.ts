import "server-only";

import type { NextResponse } from "next/server";

export function forwardSetCookie(upstream: Response, res: NextResponse): void {
  const raw = upstream.headers.get("set-cookie");
  if (!raw) return;
  const [nameValue, ...parts] = raw.split(";").map((s) => s.trim());
  const eqIdx = nameValue.indexOf("=");
  const name = nameValue.slice(0, eqIdx);
  const value = nameValue.slice(eqIdx + 1);
  const d = Object.fromEntries(
    parts.map((p) => {
      const [k, v = ""] = p.split("=");
      return [k.toLowerCase(), v];
    }),
  );
  const samesite = d["samesite"]?.toLowerCase();
  res.cookies.set(name, value, {
    httpOnly: "httponly" in d,
    secure: "secure" in d,
    sameSite: samesite === "strict" || samesite === "none" ? samesite : "lax",
    path: d["path"] || "/",
    maxAge: d["max-age"] ? Number(d["max-age"]) : undefined,
  });
}
