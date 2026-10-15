import { SignJWT } from "jose";
import { NextResponse } from "next/server";
import { googleReady, safeNext } from "@/lib/providers";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  if (!googleReady() || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(new URL("/connexion?erreur=google", url.origin));
  }
  const state = await new SignJWT({ next })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET));
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
