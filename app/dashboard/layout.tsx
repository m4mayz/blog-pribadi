import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayoutClient } from "./_components/dashboard-layout-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!session || session.user?.email !== adminEmail) {
        redirect("/");
    }

    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
