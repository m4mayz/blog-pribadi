import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [GitHub, Google],
    callbacks: {
        session({ session, user }) {
            // Add user id to session for convenience
            session.user.id = user.id;
            return session;
        },
    },
});

// Helper function to check if current user is admin
export async function isAdmin() {
    const session = await auth();
    if (!session?.user?.email) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    return session.user.email === adminEmail;
}
