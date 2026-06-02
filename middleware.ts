import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const path = req.nextUrl.pathname;
  if (!isAuth && (path.startsWith("/dashboard") || path.startsWith("/create"))) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*"],
};
