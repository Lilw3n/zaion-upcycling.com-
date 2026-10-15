import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "zaion_session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
  const path = request.nextUrl.pathname;
  const login = new URL("/connexion", request.url);
  login.searchParams.set("next", path);

  if (!token || !process.env.AUTH_SECRET) {
    return NextResponse.redirect(login);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    const role = payload.role;
    if (path.startsWith("/pilotage") && role !== "superadmin") {
      return NextResponse.redirect(new URL("/atelier", request.url));
    }
    if (path.startsWith("/atelier") && role !== "atelier" && role !== "superadmin") {
      return NextResponse.redirect(new URL("/compte", request.url));
    }
    if (path.startsWith("/compte") && role !== "client" && role !== "atelier" && role !== "superadmin") {
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(login);
  }
}

export const config = {
  matcher: ["/atelier/:path*", "/pilotage/:path*", "/compte/:path*"],
};
