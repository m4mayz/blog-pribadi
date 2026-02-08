"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Upload,
    Trash2,
    Copy,
    Search,
    Loader2,
    Check,
    Image as ImageIcon,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
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
import { cn } from "@/lib/utils";

interface MediaFile {
    key: string;
    url: string;
    name: string;
    size: number;
    uploadedAt: Date;
}

type ImageSize = "large" | "medium" | "small";

interface MediaLibraryContentProps {
    onSelect?: (url: string) => void;
    selectable?: boolean;
    selectedSize?: ImageSize;
    onSizeChange?: (size: ImageSize) => void;
}

export function MediaLibraryContent({
    onSelect,
    selectable = false,
    selectedSize,
    onSizeChange,
}: MediaLibraryContentProps) {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res) {
                toast.success("Image uploaded!");
                fetchFiles();
            }
        },
        onUploadError: (error) => {
            toast.error("Upload failed: " + error.message);
        },
    });

    const fetchFiles = async () => {
        try {
            const response = await fetch("/api/uploadthing/list");
            if (!response.ok) throw new Error("Failed to fetch files");
            const data = await response.json();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formattedFiles = data.files.map((file: any) => ({
                key: file.key,
                url: `https://utfs.io/f/${file.key}`,
                name: file.name,
                size: file.size,
                uploadedAt: new Date(file.uploadedAt),
            }));

            setFiles(formattedFiles);
            setFilteredFiles(formattedFiles);
        } catch (error) {
            console.error("Error fetching files:", error);
            toast.error("Failed to load media files");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        const filtered = files.filter((file) =>
            file.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setFilteredFiles(filtered);
    }, [searchQuery, files]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles?.length) return;
        await startUpload(Array.from(selectedFiles));
        e.target.value = "";
    };

    const handleDelete = async (fileKey: string) => {
        try {
            const response = await fetch("/api/uploadthing/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileKeys: [fileKey] }),
            });

            if (!response.ok) throw new Error("Delete failed");

            toast.success("Image deleted!");
            setFiles((prev) => prev.filter((f) => f.key !== fileKey));
        } catch (error) {
            console.error("Error deleting file:", error);
            toast.error("Failed to delete image");
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            toast.success("URL copied to clipboard!");
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (error) {
            toast.error("Failed to copy URL");
        }
    };

    const handleSelect = (url: string) => {
        if (onSelect) {
            onSelect(url);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {onSizeChange && selectedSize && (
                    <Select
                        value={selectedSize}
                        onValueChange={(value) =>
                            onSizeChange(value as ImageSize)
                        }
                    >
                        <SelectTrigger className="w-35">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-150">
                            <SelectItem value="large">Large (100%)</SelectItem>
                            <SelectItem value="medium">Medium (66%)</SelectItem>
                            <SelectItem value="small">Small (33%)</SelectItem>
                        </SelectContent>
                    </Select>
                )}
                <input
                    id="media-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <Button
                    onClick={() =>
                        document.getElementById("media-upload")?.click()
                    }
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload
                </Button>
            </div>

            {/* Media Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="aspect-square bg-muted/50 dark:bg-muted/20 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">No images yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Upload your first image to get started
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.key}
                                className={cn(
                                    "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                    selectable && selectedFile === file.url
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-border hover:border-primary/50",
                                    selectable && "cursor-pointer",
                                )}
                                onClick={() => {
                                    if (selectable) {
                                        setSelectedFile(file.url);
                                        handleSelect(file.url);
                                    }
                                }}
                            >
                                <Image
                                    src={file.url}
                                    alt={file.name}
                                    fill
                                    className="object-cover"
                                />

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="h-8 w-8"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyUrl(file.url);
                                        }}
                                    >
                                        {copiedUrl === file.url ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                className="h-8 w-8"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Delete Image?
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete
                                                    the image from UploadThing.
                                                    This action cannot be
                                                    undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() =>
                                                        handleDelete(file.key)
                                                    }
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {/* File info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-2">
                                    <p className="text-xs text-white truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {formatFileSize(file.size)}
                                    </p>
                                </div>

                                {selectable && selectedFile === file.url && (
                                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
