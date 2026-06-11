import { auth } from "./auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "aniskhelifiusthb@gmail.com";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/auth?callbackUrl=%2Fadmin", req.url));
    }
    if (req.auth.user?.email !== ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
