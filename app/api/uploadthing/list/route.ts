import { UTApi } from "uploadthing/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const utapi = new UTApi();

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

        if (!isAdmin) {
            return NextResponse.json(
                { error: "Only admins can access media library" },
                { status: 403 },
            );
        }

        // List all files from UploadThing
        const files = await utapi.listFiles();

        return NextResponse.json(files);
    } catch (error) {
        console.error("Error fetching media:", error);
        return NextResponse.json(
            { error: "Failed to fetch media" },
            { status: 500 },
        );
    }
}
