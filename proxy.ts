import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "aniskhelifiusthb@gmail.com";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;

  if (pathname.startsWith("/admin")) {
    if (!isAuth) {
      return NextResponse.redirect(new URL("/auth?callbackUrl=%2Fadmin", req.url));
    }
    if (req.auth?.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (!isAuth && (pathname.startsWith("/dashboard") || pathname.startsWith("/create"))) {
    const callbackUrl = encodeURIComponent(pathname + req.nextUrl.search);
    return NextResponse.redirect(new URL(`/auth?callbackUrl=${callbackUrl}`, req.url));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/create/:path*", "/admin/:path*"],
};
