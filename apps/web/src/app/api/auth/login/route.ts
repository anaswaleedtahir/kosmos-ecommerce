import { NextRequest } from "next/server";

import { loginSession } from "@/lib/auth-session";
import { validateBffMutation } from "@/lib/bff/mutation-guard";

export async function POST(req: NextRequest) {
  const blocked = validateBffMutation(req);
  if (blocked) return blocked;
  return loginSession(req);
}
