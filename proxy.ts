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

        // Check if user is admin (email-based)
        const adminEmail = process.env.ADMIN_EMAIL;
        const isAdmin = adminEmail && req.auth?.user?.email === adminEmail;

        if (!isAdmin) {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
