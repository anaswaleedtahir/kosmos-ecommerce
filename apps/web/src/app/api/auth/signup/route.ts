import { NextRequest } from "next/server";

import { signupSession } from "@/lib/auth-session";
import { validateBffMutation } from "@/lib/bff/mutation-guard";

export async function POST(req: NextRequest) {
  const blocked = validateBffMutation(req);
  if (blocked) return blocked;
  return signupSession(req);
}
