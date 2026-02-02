import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [GitHub, Google],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                // Add role to token
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    select: { role: true },
                });
                token.role = dbUser?.role || "user";
            }
            return token;
        },
        async session({ session, token }) {
            if (token?.id) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
});

export async function isAdmin() {
    const session = await auth();
    if (!session?.user) return false;

    // Check role from session
    if (session.user.role === "admin") return true;

    // Fallback: check admin email for backward compatibility
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && session.user.email === adminEmail) {
        // Auto-promote to admin if email matches
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: "admin" },
        });
        return true;
    }

    return false;
}
