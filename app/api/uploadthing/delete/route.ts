import { UTApi } from "uploadthing/server";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const utapi = new UTApi();

export async function POST(request: Request) {
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
                { error: "Only admins can delete images" },
                { status: 403 },
            );
        }

        const { fileKeys } = await request.json();

        if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
            return NextResponse.json(
                { error: "File keys are required" },
                { status: 400 },
            );
        }

        // Delete files from UploadThing
        await utapi.deleteFiles(fileKeys);

        return NextResponse.json({
            success: true,
            message: "Files deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting files:", error);
        return NextResponse.json(
            { error: "Failed to delete files" },
            { status: 500 },
        );
    }
}
