"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "../../_components/markdown-editor";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getPostById, updatePost, deletePost } from "@/lib/actions";
import { ArrowLeft, Save, Loader2, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditPostPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPostPage({ params }: EditPostPageProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [postId, setPostId] = useState<string>("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [slug, setSlug] = useState("");
    const [published, setPublished] = useState(false);

    useEffect(() => {
        async function loadPost() {
            const { id } = await params;
            setPostId(id);

            const post = await getPostById(id);
            if (!post) {
                toast.error("Post not found");
                router.push("/dashboard");
                return;
            }

            setTitle(post.title);
            setContent(post.content);
            setSlug(post.slug);
            setPublished(post.published);
            setIsLoading(false);
        }

        loadPost();
    }, [params, router]);

    const handleSave = () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        startTransition(async () => {
            try {
                await updatePost(postId, {
                    title: title.trim(),
                    content,
                    published,
                });

                toast.success("Post updated!");
            } catch (error) {
                toast.error("Failed to update post");
                console.error(error);
            }
        });
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePost(postId);
            toast.success("Post deleted");
            router.push("/dashboard");
        } catch (error) {
            toast.error("Failed to delete post");
            console.error(error);
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

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
                    <h1 className="text-lg font-semibold">Edit Post</h1>
                    {published && slug && (
                        <Link
                            href={`/${slug}`}
                            target="_blank"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink className="h-3 w-3" />
                            View
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Post?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your post.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

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
