"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    Link2,
    Image as ImageIcon,
    List,
    ListOrdered,
    Quote,
    Code,
    Eye,
    EyeOff,
    Loader2,
    Check,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

type ImageSize = "large" | "medium" | "small";

type ToolbarAction =
    | {
          icon: React.ElementType;
          label: string;
          action: () => void;
          divider?: never;
      }
    | {
          divider: true;
          icon?: never;
          label?: never;
          action?: never;
      };

interface MarkdownEditorProps {
    title: string;
    content: string;
    onTitleChange: (title: string) => void;
    onContentChange: (content: string) => void;
}

// Toolbar button component
function ToolbarButton({
    onClick,
    icon: Icon,
    label,
    active,
    disabled,
}: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    active?: boolean;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={cn(
                "rounded-md p-2 transition-colors",
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed",
            )}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
}

export function MarkdownEditor({
    title,
    content,
    onTitleChange,
    onContentChange,
}: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [selectedSize, setSelectedSize] = useState<ImageSize>("large");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]) {
                insertImageMarkdown(res[0].url, selectedSize);
            }
        },
        onUploadError: (error) => {
            console.error("Upload error:", error);
            alert("Upload failed: " + error.message);
        },
    });

    // Insert text at cursor position
    const insertAtCursor = useCallback(
        (before: string, after: string = "") => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.substring(start, end);

            const newContent =
                content.substring(0, start) +
                before +
                selectedText +
                after +
                content.substring(end);

            onContentChange(newContent);

            // Restore cursor position
            setTimeout(() => {
                textarea.focus();
                const newCursorPos =
                    start + before.length + selectedText.length;
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        },
        [content, onContentChange],
    );

    // Insert image markdown with size
    const insertImageMarkdown = useCallback(
        (url: string, size: ImageSize) => {
            const markdown = `![Image|${size}](${url})\n`;
            insertAtCursor(markdown);
        },
        [insertAtCursor],
    );

    // Toolbar actions
    const toolbarActions = useMemo<ToolbarAction[]>(
        () => [
            {
                icon: Bold,
                label: "Bold",
                action: () => insertAtCursor("**", "**"),
            },
            {
                icon: Italic,
                label: "Italic",
                action: () => insertAtCursor("*", "*"),
            },
            {
                icon: Heading1,
                label: "Heading 1",
                action: () => insertAtCursor("# "),
            },
            {
                icon: Heading2,
                label: "Heading 2",
                action: () => insertAtCursor("## "),
            },
            {
                icon: Heading3,
                label: "Heading 3",
                action: () => insertAtCursor("### "),
            },
            { divider: true },
            {
                icon: Link2,
                label: "Link",
                action: () => insertAtCursor("[", "](url)"),
            },
            {
                icon: List,
                label: "Bullet List",
                action: () => insertAtCursor("- "),
            },
            {
                icon: ListOrdered,
                label: "Numbered List",
                action: () => insertAtCursor("1. "),
            },
            { icon: Quote, label: "Quote", action: () => insertAtCursor("> ") },
            {
                icon: Code,
                label: "Code",
                action: () => insertAtCursor("`", "`"),
            },
        ],
        [insertAtCursor],
    );

    // Handle image upload
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = e.target.files;
        if (!files?.length) return;
        await startUpload(Array.from(files));
        e.target.value = "";
    };

    return (
        <div className="flex flex-col h-full">
            {/* Title Input */}
            <Input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Post title..."
                className="border-0 bg-transparent text-3xl font-bold placeholder:text-muted-foreground/50 focus-visible:ring-0 px-0 mb-4"
            />

            {/* Toolbar */}
            <div className="flex items-center gap-1 border-b border-border pb-3 mb-4 flex-wrap">
                {/* eslint-disable-next-line */}
                {toolbarActions.map((action, index) =>
                    "divider" in action ? (
                        <div key={index} className="w-px h-6 bg-border mx-1" />
                    ) : (
                        <ToolbarButton
                            key={action.label}
                            icon={action.icon}
                            label={action.label}
                            onClick={action.action}
                        />
                    ),
                )}

                {/* Image Upload with Size Selector */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            disabled={isUploading}
                            className={cn(
                                "rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground flex items-center gap-1",
                                isUploading && "opacity-50 cursor-not-allowed",
                            )}
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ImageIcon className="h-4 w-4" />
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                            Select Size
                        </div>
                        {(["large", "medium", "small"] as ImageSize[]).map(
                            (size) => (
                                <DropdownMenuItem
                                    key={size}
                                    onClick={() => {
                                        setSelectedSize(size);
                                        document
                                            .getElementById("image-upload")
                                            ?.click();
                                    }}
                                    className="flex items-center justify-between"
                                >
                                    <span className="capitalize">{size}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {size === "large" && "100%"}
                                        {size === "medium" && "66%"}
                                        {size === "small" && "33%"}
                                    </span>
                                    {selectedSize === size && (
                                        <Check className="h-3 w-3 ml-2" />
                                    )}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />

                {/* Preview Toggle */}
                <div className="ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                        className="gap-2"
                    >
                        {showPreview ? (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Hide Preview
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                Preview
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Editor / Preview */}
            <div className="flex-1 overflow-hidden">
                {showPreview ? (
                    <div className="h-full overflow-y-auto">
                        <div className="prose-medium max-w-none">
                            <ReactMarkdown
                                components={{
                                    img: ({ alt, src }) => {
                                        // Parse size from alt text: "alt|size"
                                        const [altText, size] = (
                                            alt || ""
                                        ).split("|");
                                        const sizeClass =
                                            {
                                                large: "w-full max-w-[768px]",
                                                medium: "w-2/3 max-w-[507px]",
                                                small: "w-1/3 max-w-[254px]",
                                            }[size as ImageSize] ||
                                            "w-full max-w-[768px]";

                                        return (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={src}
                                                alt={altText}
                                                className={cn(
                                                    sizeClass,
                                                    "rounded-lg",
                                                )}
                                            />
                                        );
                                    },
                                }}
                            >
                                {content || "*No content yet...*"}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <Textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => onContentChange(e.target.value)}
                        placeholder="Write your content in Markdown..."
                        className="h-full min-h-100 resize-none border-0 bg-transparent focus-visible:ring-0 font-mono text-sm leading-relaxed"
                    />
                )}
            </div>
        </div>
    );
}
