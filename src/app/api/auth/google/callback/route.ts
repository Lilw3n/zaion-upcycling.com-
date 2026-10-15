import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureAuthSchema } from "@/db/ensure";
import { users, type Role } from "@/db/schema";
import { roleForEmail } from "@/lib/access";
import { googleReady, safeNext } from "@/lib/providers";
import { homeFor, setSession } from "@/lib/session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fail = (code: string) => NextResponse.redirect(new URL(`/connexion?erreur=${code}`, url.origin));
  if (!googleReady() || !process.env.AUTH_SECRET) return fail("google");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("google");

  let next = "";
  try {
    const { payload } = await jwtVerify(state, new TextEncoder().encode(process.env.AUTH_SECRET));
    next = safeNext(typeof payload.next === "string" ? payload.next : "");
  } catch {
    return fail("google");
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return fail("google");
  const token = (await tokenResponse.json()) as { access_token?: string };
  if (!token.access_token) return fail("google");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) return fail("google");
  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  const email = profile.email?.toLowerCase();
  if (!profile.sub || !email || profile.email_verified === false) return fail("google");

  await ensureAuthSchema();
  const [byGoogle] = await db.select().from(users).where(eq(users.googleSub, profile.sub));
  const [byEmail] = byGoogle ? [byGoogle] : await db.select().from(users).where(eq(users.email, email));
  let account = byEmail;

  const role = (account && roleForEmail(email) === "client" ? account.role : roleForEmail(email)) as Role;
  if (account) {
    await db.update(users).set({
      googleSub: profile.sub,
      authProvider: "google",
      emailVerified: true,
      role,
    }).where(eq(users.id, account.id));
  }
  if (!account) {
    const id = `usr_${crypto.randomUUID().slice(0, 10)}`;
    const name = profile.name || email;
    await db.insert(users).values({
      id,
      email,
      name,
      role,
      emailVerified: true,
      googleSub: profile.sub,
      authProvider: "google",
      passwordHash: await bcrypt.hash(randomBytes(24).toString("hex"), 10),
    });
    account = { id, email, name, role, emailVerified: true } as typeof account;
  }
  if (!account) return fail("google");
  await setSession({ id: account.id, email: account.email, name: account.name, role });
  return NextResponse.redirect(new URL(next || homeFor(role), url.origin));
}
