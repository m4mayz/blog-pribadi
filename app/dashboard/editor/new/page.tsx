"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "../../_components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createPost } from "@/lib/actions";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export default function NewPostPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        startTransition(async () => {
            try {
                const post = await createPost({
                    title: title.trim(),
                    slug: generateSlug(title),
                    content,
                    thumbnail: "",
                    published,
                });

                toast.success(published ? "Post published!" : "Draft saved!");
                router.push(`/dashboard/editor/${post.id}`);
            } catch (error) {
                toast.error("Failed to save post");
                console.error(error);
            }
        });
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-lg font-semibold">New Post</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="published"
                            checked={published}
                            onCheckedChange={setPublished}
                        />
                        <Label htmlFor="published" className="text-sm">
                            {published ? "Published" : "Draft"}
                        </Label>
                    </div>

                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save
                    </Button>
                </div>
            </header>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6">
                <div className="mx-auto max-w-4xl h-full">
                    <MarkdownEditor
                        title={title}
                        content={content}
                        onTitleChange={setTitle}
                        onContentChange={setContent}
                    />
                </div>
            </div>
        </div>
    );
}
