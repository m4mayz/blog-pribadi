"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { MediaLibraryModal } from "@/components/media-library-modal";

interface PostMetadataFormProps {
    slug: string;
    excerpt: string;
    thumbnail: string;
    onSlugChange: (slug: string) => void;
    onExcerptChange: (excerpt: string) => void;
    onThumbnailChange: (thumbnail: string) => void;
    canEditSlug?: boolean;
}

export function PostMetadataForm({
    slug,
    excerpt,
    thumbnail,
    onSlugChange,
    onExcerptChange,
    onThumbnailChange,
    canEditSlug = false,
}: PostMetadataFormProps) {
    const [uploadStatus, setUploadStatus] = useState<
        "idle" | "uploading" | "success" | "error"
    >("idle");
    const [thumbnailPreview, setThumbnailPreview] = useState(thumbnail);
    const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);

    const handleUrlInput = (url: string) => {
        onThumbnailChange(url);
        setThumbnailPreview(url);
    };

    const handleDeleteImage = () => {
        // Reset featured image to empty state
        onThumbnailChange("");
        setThumbnailPreview("");
        setUploadedFileKey(null);
        setUploadStatus("idle");
    };

    return (
        <div className="space-y-6">
            {/* Thumbnail Section */}
            <div className="space-y-3 pb-6 border-b border-border">
                <div>
                    <Label className="text-sm font-semibold">
                        Featured Image
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Post thumbnail image
                    </p>
                </div>

                {/* Preview */}
                {thumbnailPreview && (
                    <div className="relative aspect-video rounded-md overflow-hidden bg-muted border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                            onError={() => setThumbnailPreview("")}
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={handleDeleteImage}
                            title="Remove image"
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* URL Input */}
                <div className="space-y-1.5">
                    <Label
                        htmlFor="thumbnail-url"
                        className="text-xs text-muted-foreground"
                    >
                        Image URL
                    </Label>
                    <Input
                        id="thumbnail-url"
                        type="url"
                        value={thumbnail}
                        onChange={(e) => handleUrlInput(e.target.value)}
                        placeholder="https://..."
                        className="h-9 text-xs"
                    />
                </div>

                {/* Media Library Button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMediaLibrary(true)}
                    className="w-full h-9"
                >
                    <FolderOpen className="mr-2 h-3.5 w-3.5" />
                    Browse Media Library
                </Button>
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                open={showMediaLibrary}
                onOpenChange={setShowMediaLibrary}
                onSelect={(url) => {
                    handleUrlInput(url);
                    setShowMediaLibrary(false);
                }}
            />

            {/* Slug Section */}
            <div className="space-y-3 pb-6 border-b border-border">
                <div>
                    <Label htmlFor="slug" className="text-sm font-semibold">
                        URL Slug
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {canEditSlug
                            ? "Customize post URL"
                            : "Auto-generated from title"}
                    </p>
                </div>

                <div className="text-xs text-muted-foreground font-mono">
                    /{slug || "post-slug"}
                </div>

                {canEditSlug ? (
                    <Input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            // Auto-format slug
                            const formatted = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "-")
                                .replace(/-+/g, "-")
                                .replace(/^-|-$/g, "");
                            onSlugChange(formatted);
                        }}
                        placeholder="my-awesome-post"
                        className="h-9 font-mono text-xs"
                    />
                ) : (
                    <Input
                        id="slug"
                        type="text"
                        value={slug}
                        disabled
                        className="h-9 font-mono text-xs bg-muted"
                    />
                )}
            </div>

            {/* Excerpt Section */}
            <div className="space-y-3">
                <div>
                    <Label htmlFor="excerpt" className="text-sm font-semibold">
                        Excerpt
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Brief summary for SEO (optional)
                    </p>
                </div>

                <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => onExcerptChange(e.target.value)}
                    placeholder="Write a compelling summary..."
                    rows={3}
                    className="resize-none text-xs"
                />
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        120-160 chars recommended
                    </span>
                    <span
                        className={cn(
                            "font-medium",
                            excerpt.length > 160 && "text-orange-500",
                            excerpt.length > 0 &&
                                excerpt.length <= 160 &&
                                "text-green-500",
                            excerpt.length === 0 && "text-muted-foreground",
                        )}
                    >
                        {excerpt.length}/160
                    </span>
                </div>
            </div>
        </div>
    );
}
