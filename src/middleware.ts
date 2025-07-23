// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("token")?.value;
  const guestUID = request.cookies.get("user_uid")?.value;
  const { pathname } = request.nextUrl;

  // List of protected paths
  const protectedPaths = ["/profile/settings", "/purchases", "/profile"];
  // List of auth pages
  const authPages = ["/signin", "/signup"];
  // List of public pages (won't be redirected)
  const publicPages = ["/proxy", "/proxy/detail"];

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPage = authPages.some((path) => pathname.startsWith(path));
  const isPublicPage = publicPages.some((path) => pathname.startsWith(path));
  const isRoot = pathname === "/";

  // Redirect root path to /proxy
  if (isRoot) {
    return NextResponse.redirect(new URL("/proxy", request.url));
  }

  // If on public page, allow access regardless of auth status
  if (isPublicPage) {
    return NextResponse.next();
  }

  // If user has token or guest UID and tries to access auth pages, redirect to /proxy
  if ((authToken || guestUID) && isAuthPage) {
    return NextResponse.redirect(new URL("/proxy", request.url));
  }

  // If user has neither token nor guest UID and tries to access protected pages, redirect to /signin
  if (isProtected && !authToken && !guestUID) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
