import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/db/schema";

export type Session = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const COOKIE = "zaion_session";

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET manquant");
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session) {
  return new SignJWT({ email: session.email, name: session.name, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.id)
    .setExpirationTime("14d")
    .sign(key());
}

export async function setSession(session: Session) {
  const token = await signSession(session);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    const role = payload.role;
    if (role !== "superadmin" && role !== "atelier" && role !== "client") return null;
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role,
    };
  } catch {
    return null;
  }
}

export function homeFor(role: Role) {
  if (role === "superadmin") return "/pilotage";
  if (role === "atelier") return "/atelier";
  return "/compte";
}
