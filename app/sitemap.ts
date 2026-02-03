import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    // Fetch all published posts
    const posts = await prisma.post.findMany({
        where: { published: true },
        select: {
            slug: true,
            updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
    });

    // Homepage
    const homepage: MetadataRoute.Sitemap[0] = {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
    };

    // Post pages
    const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${baseUrl}/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
    }));

    return [homepage, ...postPages];
}
