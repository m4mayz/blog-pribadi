import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Protect /dashboard routes
    if (pathname.startsWith("/dashboard")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/api/auth/signin", req.url));
        }

        // Check if user is admin (role-based with email fallback)
        const isAdmin =
            req.auth?.user?.role === "admin" ||
            req.auth?.user?.email === process.env.ADMIN_EMAIL;

        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
