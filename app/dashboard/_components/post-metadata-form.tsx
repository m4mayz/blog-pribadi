"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Image as ImageIcon,
    Link2,
    Type,
    FileText,
    Trash2,
    FolderOpen,
    Check,
} from "lucide-react";
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
            <Card className="overflow-hidden">
                <div className="px-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <Label className="text-base font-semibold">
                                Featured Image
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Upload or paste image URL for post thumbnail
                            </p>
                        </div>
                    </div>

                    {/* Preview */}
                    {thumbnailPreview && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={thumbnailPreview}
                                alt="Thumbnail preview"
                                className="w-full h-full object-cover"
                                onError={() => setThumbnailPreview("")}
                            />
                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                                    <Check className="h-3 w-3 text-green-500" />
                                    <span>Image loaded</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="h-7 w-7 shadow-lg"
                                    onClick={handleDeleteImage}
                                    title="Remove featured image"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* URL Input */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="thumbnail-url"
                            className="text-sm font-medium flex items-center gap-2"
                        >
                            <Link2 className="h-3 w-3" />
                            Image URL
                        </Label>
                        <Input
                            id="thumbnail-url"
                            type="url"
                            value={thumbnail}
                            onChange={(e) => handleUrlInput(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="font-mono text-sm"
                        />
                    </div>

                    {/* Media Library Button */}
                    <div className="relative">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <FolderOpen className="h-3 w-3" />
                            Select from media library or paste URL above
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowMediaLibrary(true)}
                            className="w-full"
                        >
                            <FolderOpen className="mr-2 h-4 w-4" />
                            Browse Media Library
                        </Button>
                    </div>
                </div>
            </Card>

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
            <Card className="px-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Link2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                        <Label
                            htmlFor="slug"
                            className="text-base font-semibold"
                        >
                            URL Slug
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {canEditSlug
                                ? "Customize the URL for this post"
                                : "Auto-generated from title (editable after creation)"}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Type className="h-3 w-3" />
                        <span className="font-mono">
                            /{slug || "post-slug"}
                        </span>
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
                            className="font-mono text-sm"
                        />
                    ) : (
                        <Input
                            id="slug"
                            type="text"
                            value={slug}
                            disabled
                            className="font-mono text-sm bg-muted"
                        />
                    )}
                </div>
            </Card>

            {/* Excerpt Section */}
            <Card className="p-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <Label
                            htmlFor="excerpt"
                            className="text-base font-semibold"
                        >
                            Excerpt
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            A brief summary for SEO and post previews (optional)
                        </p>
                    </div>
                </div>

                <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => onExcerptChange(e.target.value)}
                    placeholder="Write a compelling summary of your post..."
                    rows={3}
                    className="resize-none"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Recommended: 120-160 characters for SEO</span>
                    <span
                        className={cn(
                            excerpt.length > 160 && "text-orange-500",
                            excerpt.length > 0 &&
                                excerpt.length <= 160 &&
                                "text-green-500",
                        )}
                    >
                        {excerpt.length} / 160
                    </span>
                </div>
            </Card>
        </div>
    );
}
