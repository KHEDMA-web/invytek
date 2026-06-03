import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const path = req.nextUrl.pathname;
  if (!isAuth && (path.startsWith("/dashboard") || path.startsWith("/create"))) {
    const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/auth?callbackUrl=${callbackUrl}`, req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*"],
};
