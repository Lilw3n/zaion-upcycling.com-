import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureAuthSchema } from "@/db/ensure";
import { authTokens, users, type Role } from "@/db/schema";
import { homeFor, setSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const fail = NextResponse.redirect(new URL("/connexion?erreur=lien", url.origin));
  if (token.length < 20) return fail;
  await ensureAuthSchema();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [row] = await db.select().from(authTokens).where(and(eq(authTokens.tokenHash, tokenHash), eq(authTokens.purpose, "magic")));
  if (!row || row.used || row.expiresAt.getTime() < Date.now()) return fail;
  await db.update(authTokens).set({ used: true }).where(eq(authTokens.id, row.id));
  const [user] = await db.select().from(users).where(eq(users.email, row.email));
  if (!user) return fail;
  const role = user.role as Role;
  await setSession({ id: user.id, email: user.email, name: user.name, role });
  return NextResponse.redirect(new URL(homeFor(role), url.origin));
}
