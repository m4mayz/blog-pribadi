"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPost, updatePost, deletePost } from "@/lib/actions";
import { Loader2, Save, Trash2, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface PostData {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
}

interface PostEditorProps {
    initialData?: PostData;
    isNew?: boolean;
}

export function PostEditor({ initialData, isNew = false }: PostEditorProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showPreview, setShowPreview] = useState(false);

    const [formData, setFormData] = useState<PostData>({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",
        content: initialData?.content || "",
        published: initialData?.published || false,
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: isNew ? generateSlug(value) : prev.slug,
        }));
    };

    const handleSubmit = () => {
        startTransition(async () => {
            try {
                if (isNew) {
                    await createPost(formData);
                } else if (initialData?.id) {
                    await updatePost(initialData.id, formData);
                }
                router.push("/dashboard");
                router.refresh();
            } catch (error) {
                console.error("Failed to save post:", error);
                alert("Failed to save post");
            }
        });
    };

    const handleDelete = () => {
        if (!initialData?.id) return;
        if (!confirm("Are you sure you want to delete this post?")) return;

        startTransition(async () => {
            try {
                await deletePost(initialData.id!);
                router.push("/dashboard");
                router.refresh();
            } catch (error) {
                console.error("Failed to delete post:", error);
                alert("Failed to delete post");
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isNew ? "New Post" : "Edit Post"}
                </h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <Eye className="mr-2 h-4 w-4" />
                        {showPreview ? "Edit" : "Preview"}
                    </Button>
                    {!isNew && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    )}
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {isNew ? "Publish" : "Save"}
                    </Button>
                </div>
            </div>

            {showPreview ? (
                /* Preview Mode */
                <Card>
                    <CardHeader>
                        <CardTitle>{formData.title || "Untitled"}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
                        <ReactMarkdown>{formData.content}</ReactMarkdown>
                    </CardContent>
                </Card>
            ) : (
                /* Edit Mode */
                <div className="grid gap-6">
                    {/* Title & Slug */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    handleTitleChange(e.target.value)
                                }
                                placeholder="Post title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        slug: e.target.value,
                                    }))
                                }
                                placeholder="post-url-slug"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    excerpt: e.target.value,
                                }))
                            }
                            placeholder="Brief summary of the post..."
                            rows={2}
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Content (Markdown)</Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                }))
                            }
                            placeholder="Write your post in Markdown..."
                            rows={20}
                            className="font-mono"
                        />
                    </div>

                    {/* Published Toggle */}
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="published"
                            checked={formData.published}
                            onCheckedChange={(checked) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    published: checked,
                                }))
                            }
                        />
                        <Label htmlFor="published">Published</Label>
                    </div>
                </div>
            )}
        </div>
    );
}
