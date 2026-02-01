export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getPostById } from "@/lib/actions";
import { PostEditor } from "@/components/post-editor";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
        notFound();
    }

    return (
        <PostEditor
            initialData={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || "",
                content: post.content,
                published: post.published,
            }}
        />
    );
}
