"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "../../_components/markdown-editor";
import { PostMetadataForm } from "../../_components/post-metadata-form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createPost } from "@/lib/actions";
import { ArrowLeft, Save, Loader2, Settings2 } from "lucide-react";
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
    const [showMetadata, setShowMetadata] = useState(true);

    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [content, setContent] = useState("");
    const [published, setPublished] = useState(false);

    // Auto-generate slug from title on title change
    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (!slug) {
            setSlug(generateSlug(newTitle));
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        // Note: Thumbnail will be added in edit page
        // For now, use a default placeholder
        const defaultThumbnail =
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop";

        startTransition(async () => {
            try {
                const post = await createPost({
                    title: title.trim(),
                    slug: generateSlug(title),
                    content,
                    thumbnail: defaultThumbnail,
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
            <header className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">New Post</h1>
                        <p className="text-xs text-muted-foreground">
                            Fill in all details before publishing
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMetadata(!showMetadata)}
                        className="gap-2"
                    >
                        <Settings2 className="h-4 w-4" />
                        {showMetadata ? "Hide" : "Show"} Details
                    </Button>

                    <div className="h-6 w-px bg-border" />

                    <div className="flex items-center gap-2">
                        <Switch
                            id="published"
                            checked={published}
                            onCheckedChange={setPublished}
                        />
                        <Label
                            htmlFor="published"
                            className="text-sm font-medium"
                        >
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

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Editor */}
                <div className="flex-1 overflow-hidden p-6">
                    <div className="mx-auto max-w-4xl h-full">
                        <MarkdownEditor
                            title={title}
                            content={content}
                            onTitleChange={handleTitleChange}
                            onContentChange={setContent}
                        />
                    </div>
                </div>

                {/* Metadata Sidebar */}
                {showMetadata && (
                    <div className="w-96 border-l border-border overflow-y-auto bg-background">
                        <div className="p-6">
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-1">
                                    Post Details
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Configure metadata and appearance
                                </p>
                            </div>
                            <PostMetadataForm
                                slug={slug}
                                excerpt={excerpt}
                                thumbnail={thumbnail}
                                onSlugChange={setSlug}
                                onExcerptChange={setExcerpt}
                                onThumbnailChange={setThumbnail}
                                canEditSlug={false}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
