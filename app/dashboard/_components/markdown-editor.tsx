"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
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
    CodeSquare,
    Eye,
    EyeOff,
    Loader2,
    Undo,
    Redo,
    Columns2,
    Table,
    Search,
    Upload,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { MediaLibraryModal } from "@/components/media-library-modal";

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
        /youtube\.com\/embed\/([^?\s]+)/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

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
            aria-label={label}
            aria-pressed={active}
            className={cn(
                "rounded-md p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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
    const [splitView, setSplitView] = useState(false);
    const [selectedSize, setSelectedSize] = useState<ImageSize>("large");
    const [showMediaLibrary, setShowMediaLibrary] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkText, setLinkText] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [showTableDialog, setShowTableDialog] = useState(false);
    const [tableRows, setTableRows] = useState("3");
    const [tableCols, setTableCols] = useState("3");
    const [showFindDialog, setShowFindDialog] = useState(false);
    const [findText, setFindText] = useState("");
    const [replaceText, setReplaceText] = useState("");
    const [isDragging, setIsDragging] = useState(false);

    // History state for undo/redo
    const [history, setHistory] = useState<string[]>([content]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isUndoRedoRef = useRef(false);
    const historyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { startUpload, isUploading } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res?.[0]) {
                insertImageMarkdown(res[0].url, selectedSize);
            }
        },
        onUploadError: (error) => {
            console.error("Upload error:", error);
            toast.error("Upload failed: " + error.message);
        },
    });

    // Track content changes for undo/redo with debouncing
    useEffect(() => {
        if (isUndoRedoRef.current) {
            isUndoRedoRef.current = false;
            return;
        }

        // Debounce history updates to avoid too many entries
        if (historyTimeoutRef.current) {
            clearTimeout(historyTimeoutRef.current);
        }

        historyTimeoutRef.current = setTimeout(() => {
            const lastEntry = history[historyIndex];
            if (content !== lastEntry) {
                // Remove any future history when new change is made
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(content);

                // Limit history to last 50 entries
                if (newHistory.length > 50) {
                    newHistory.shift();
                } else {
                    setHistoryIndex(historyIndex + 1);
                }

                setHistory(newHistory);
            }
        }, 500); // 500ms debounce

        return () => {
            if (historyTimeoutRef.current) {
                clearTimeout(historyTimeoutRef.current);
            }
        };
    }, [content]);

    // Undo function
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            isUndoRedoRef.current = true;
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            onContentChange(history[newIndex]);
            textareaRef.current?.focus();
        }
    }, [historyIndex, history, onContentChange]);

    // Redo function
    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            isUndoRedoRef.current = true;
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            onContentChange(history[newIndex]);
            textareaRef.current?.focus();
        }
    }, [historyIndex, history, onContentChange]);

    // Insert text at cursor position with smart line detection
    const insertAtCursor = useCallback(
        (before: string, after: string = "", isHeading: boolean = false) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = content.substring(start, end);

            // Smart heading insertion: ensure heading starts at line beginning
            let prefix = "";
            if (isHeading && start > 0) {
                const beforeCursor = content.substring(0, start);
                const lastNewline = beforeCursor.lastIndexOf("\n");
                const currentLineStart = lastNewline + 1;
                const currentLineText = content.substring(
                    currentLineStart,
                    start,
                );

                // If not at line start and line has content, add newline
                if (currentLineText.trim().length > 0) {
                    prefix = "\n";
                }
            }

            const newContent =
                content.substring(0, start) +
                prefix +
                before +
                selectedText +
                after +
                content.substring(end);

            onContentChange(newContent);

            // Restore cursor position
            setTimeout(() => {
                textarea.focus();
                const newCursorPos =
                    start + prefix.length + before.length + selectedText.length;
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

    // Insert code block
    const insertCodeBlock = useCallback(
        (language: string = "") => {
            const markdown = `\`\`\`${language}\n\n\`\`\`\n`;
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const cursorOffset = 4 + language.length; // Position cursor after ```language\n
            insertAtCursor(markdown);

            // Position cursor inside code block
            setTimeout(() => {
                textarea.focus();
                const newPos = start + cursorOffset;
                textarea.setSelectionRange(newPos, newPos);
            }, 0);
        },
        [insertAtCursor],
    );

    // Open link dialog
    const openLinkDialog = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        setLinkText(selectedText);
        setLinkUrl("");
        setShowLinkDialog(true);
    }, [content]);

    // Insert link from dialog
    const insertLink = useCallback(() => {
        if (!linkUrl) return;

        const markdown = `[${linkText || "link"}](${linkUrl})`;
        insertAtCursor(markdown);

        setShowLinkDialog(false);
        setLinkText("");
        setLinkUrl("");
    }, [linkText, linkUrl, insertAtCursor]);

    // Generate table
    const generateTable = useCallback(() => {
        const rows = parseInt(tableRows) || 3;
        const cols = parseInt(tableCols) || 3;

        if (rows < 1 || cols < 1 || rows > 10 || cols > 10) {
            toast.error("Table size must be between 1-10 rows/columns");
            return;
        }

        // Create header row
        let table = "|" + " Header |".repeat(cols) + "\n";
        // Create separator
        table += "|" + " --- |".repeat(cols) + "\n";
        // Create data rows
        for (let i = 0; i < rows; i++) {
            table += "|" + " Cell |".repeat(cols) + "\n";
        }

        insertAtCursor(table + "\n");
        setShowTableDialog(false);
        setTableRows("3");
        setTableCols("3");
    }, [tableRows, tableCols, insertAtCursor]);

    // Find and replace
    const handleFindReplace = useCallback(
        (replaceAll: boolean = false) => {
            if (!findText) return;

            const textarea = textareaRef.current;
            if (!textarea) return;

            if (replaceAll) {
                const newContent = content.split(findText).join(replaceText);
                const count = content.split(findText).length - 1;
                onContentChange(newContent);
                toast.success(`Replaced ${count} occurrence(s)`);
            } else {
                // Find next occurrence
                const start = textarea.selectionStart;
                const index = content.indexOf(findText, start);

                if (index !== -1) {
                    textarea.setSelectionRange(index, index + findText.length);
                    textarea.focus();

                    // Replace current selection
                    if (replaceText && textarea.selectionStart === index) {
                        const newContent =
                            content.substring(0, index) +
                            replaceText +
                            content.substring(index + findText.length);
                        onContentChange(newContent);
                        setTimeout(() => {
                            textarea.setSelectionRange(
                                index + replaceText.length,
                                index + replaceText.length,
                            );
                        }, 0);
                    }
                } else {
                    toast.error("No more occurrences found");
                }
            }
        },
        [findText, replaceText, content, onContentChange],
    );

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter((file) =>
                file.type.startsWith("image/"),
            );

            if (imageFiles.length === 0) {
                toast.error("Please drop image files only");
                return;
            }

            if (imageFiles.length > 1) {
                toast.error("Please drop one image at a time");
                return;
            }

            await startUpload(imageFiles);
        },
        [startUpload],
    );

    // Handle Enter key for smart list continuation
    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter") {
                const textarea = textareaRef.current;
                if (!textarea) return;

                const start = textarea.selectionStart;
                const beforeCursor = content.substring(0, start);
                const lastNewline = beforeCursor.lastIndexOf("\n");
                const currentLine = beforeCursor.substring(lastNewline + 1);

                // Check for bullet list
                const bulletMatch = currentLine.match(/^(\s*)-\s/);
                if (bulletMatch) {
                    e.preventDefault();
                    const indent = bulletMatch[1];
                    // If line is empty (just "- "), remove it and exit list
                    if (currentLine.trim() === "-") {
                        const newContent =
                            content.substring(0, lastNewline + 1) +
                            content.substring(start);
                        onContentChange(newContent);
                        setTimeout(() => {
                            textarea.setSelectionRange(
                                lastNewline + 1,
                                lastNewline + 1,
                            );
                        }, 0);
                    } else {
                        insertAtCursor(`\n${indent}- `);
                    }
                    return;
                }

                // Check for numbered list
                const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s/);
                if (numberedMatch) {
                    e.preventDefault();
                    const indent = numberedMatch[1];
                    const num = parseInt(numberedMatch[2]);
                    // If line is empty (just "1. "), remove it and exit list
                    if (currentLine.trim().match(/^\d+\.$/)) {
                        const newContent =
                            content.substring(0, lastNewline + 1) +
                            content.substring(start);
                        onContentChange(newContent);
                        setTimeout(() => {
                            textarea.setSelectionRange(
                                lastNewline + 1,
                                lastNewline + 1,
                            );
                        }, 0);
                    } else {
                        insertAtCursor(`\n${indent}${num + 1}. `);
                    }
                    return;
                }
            }
        },
        [content, insertAtCursor, onContentChange],
    );

    // Toolbar actions
    const toolbarActions = useMemo<ToolbarAction[]>(
        () => [
            {
                icon: Bold,
                label: "Bold (Ctrl+B)",
                action: () => insertAtCursor("**", "**"),
            },
            {
                icon: Italic,
                label: "Italic (Ctrl+I)",
                action: () => insertAtCursor("*", "*"),
            },
            {
                icon: Heading1,
                label: "Heading 1",
                action: () => insertAtCursor("# ", "", true),
            },
            {
                icon: Heading2,
                label: "Heading 2",
                action: () => insertAtCursor("## ", "", true),
            },
            {
                icon: Heading3,
                label: "Heading 3",
                action: () => insertAtCursor("### ", "", true),
            },
            { divider: true },
            {
                icon: Link2,
                label: "Link (Ctrl+K)",
                action: openLinkDialog,
            },
            {
                icon: List,
                label: "Bullet List",
                action: () => insertAtCursor("- ", "", true),
            },
            {
                icon: ListOrdered,
                label: "Numbered List",
                action: () => insertAtCursor("1. ", "", true),
            },
            {
                icon: Quote,
                label: "Quote (Ctrl+/)",
                action: () => insertAtCursor("> ", "", true),
            },
        ],
        [insertAtCursor, openLinkDialog],
    );

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (!modifier) return;

            switch (e.key.toLowerCase()) {
                case "b":
                    e.preventDefault();
                    insertAtCursor("**", "**");
                    break;
                case "i":
                    e.preventDefault();
                    insertAtCursor("*", "*");
                    break;
                case "k":
                    e.preventDefault();
                    openLinkDialog();
                    break;
                case "/":
                    e.preventDefault();
                    insertAtCursor("> ", "", true);
                    break;
                case "f":
                    e.preventDefault();
                    setShowFindDialog(true);
                    break;
                case "p":
                    if (e.shiftKey) {
                        e.preventDefault();
                        setShowPreview((prev) => !prev);
                    }
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [insertAtCursor, handleUndo, handleRedo, openLinkDialog]);

    // Calculate statistics
    const wordCount = useMemo(() => {
        return content
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
    }, [content]);

    const charCount = useMemo(() => content.length, [content]);

    const readingTime = useMemo(() => {
        return Math.ceil(wordCount / 200);
    }, [wordCount]);

    return (
        <div className="flex flex-col h-full">
            {/* Title Input */}
            <Input
                type="text"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Post title..."
                aria-label="Post title"
                className="border-0 bg-transparent text-3xl md:text-3xl font-bold placeholder:text-muted-foreground/60 focus-visible:ring-0 px-0 mb-4 h-auto"
            />

            {/* Toolbar */}
            <div
                className="sticky top-0 z-10 bg-background flex items-center gap-1 border-b border-border pb-3 mb-4 flex-wrap"
                role="toolbar"
                aria-label="Markdown formatting toolbar"
            >
                {" "}
                {/* Undo/Redo buttons */}
                <ToolbarButton
                    icon={Undo}
                    label="Undo (Ctrl+Z)"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                />
                <ToolbarButton
                    icon={Redo}
                    label="Redo (Ctrl+Y)"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                />
                <div className="w-px h-6 bg-border mx-1" />
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
                {/* Image Insert Button */}
                <button
                    type="button"
                    onClick={() => setShowMediaLibrary(true)}
                    disabled={isUploading}
                    title="Insert Image"
                    aria-label="Insert image from media library"
                    className={cn(
                        "rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        isUploading && "opacity-50 cursor-not-allowed",
                    )}
                >
                    {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <ImageIcon className="h-4 w-4" />
                    )}
                </button>
                {/* Code Block Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            title="Code Block"
                            aria-label="Insert code block"
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <CodeSquare className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => insertCodeBlock("")}>
                            Plain Text
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("javascript")}
                        >
                            JavaScript
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("typescript")}
                        >
                            TypeScript
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("python")}
                        >
                            Python
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("bash")}
                        >
                            Bash
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("css")}
                        >
                            CSS
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("html")}
                        >
                            HTML
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => insertCodeBlock("json")}
                        >
                            JSON
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* Table Button */}
                <button
                    type="button"
                    onClick={() => setShowTableDialog(true)}
                    title="Insert Table"
                    aria-label="Insert table"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    <Table className="h-4 w-4" />
                </button>
                {/* Find & Replace Button */}
                <button
                    type="button"
                    onClick={() => setShowFindDialog(true)}
                    title="Find & Replace (Ctrl+F)"
                    aria-label="Find and replace text"
                    className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                    <Search className="h-4 w-4" />
                </button>
                {/* Preview Toggle */}
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSplitView(!splitView);
                            if (!splitView) setShowPreview(false);
                        }}
                        className="gap-2"
                        aria-label={
                            splitView ? "Close split view" : "Open split view"
                        }
                        aria-pressed={splitView}
                    >
                        <Columns2 className="h-4 w-4" />
                        Split
                    </Button>
                    {!splitView && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="gap-2"
                            aria-label={
                                showPreview ? "Hide preview" : "Show preview"
                            }
                            aria-pressed={showPreview}
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
                    )}
                </div>
            </div>

            {/* Editor / Preview */}
            <div
                className={cn(
                    "flex-1 overflow-hidden",
                    splitView && "flex gap-4",
                )}
            >
                {/* Editor */}
                {(!showPreview || splitView) && (
                    <div
                        className={cn(
                            "h-full relative",
                            splitView ? "flex-1" : "w-full",
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        {isDragging && (
                            <div className="absolute inset-0 z-10 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                                <div className="bg-background/95 backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-primary" />
                                    <p className="text-sm font-medium">
                                        Drop image here
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Only one image at a time
                                    </p>
                                </div>
                            </div>
                        )}
                        <Textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => onContentChange(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Write your content in Markdown..."
                            aria-label="Post content editor"
                            className="h-full min-h-100 resize-none border-0 bg-transparent focus-visible:ring-0 font-mono text-base leading-loose"
                        />
                    </div>
                )}

                {/* Preview */}
                {(showPreview || splitView) && (
                    <div
                        className={cn(
                            "h-full overflow-y-auto",
                            splitView
                                ? "flex-1 border-l border-border pl-4"
                                : "w-full",
                        )}
                        role="region"
                        aria-label="Markdown preview"
                    >
                        <div className="prose-medium max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeRaw]}
                                components={{
                                    // Override paragraph to handle images without nesting issues
                                    p: ({ node, children, ...props }) => {
                                        // Check if paragraph only contains an image by checking AST node
                                        const hasOnlyImage =
                                            node?.children?.length === 1 &&
                                            node.children[0].type ===
                                                "element" &&
                                            node.children[0].tagName === "img";

                                        // If it's just an image, return children without p wrapper
                                        if (hasOnlyImage) {
                                            return <>{children}</>;
                                        }

                                        return <p {...props}>{children}</p>;
                                    },
                                    // Center-align images with size support
                                    img: ({ alt, src }) => {
                                        const [altText, size] = (
                                            alt || ""
                                        ).split("|");
                                        const sizeClass =
                                            {
                                                large: "w-full max-w-3xl",
                                                medium: "w-2/3 max-w-[507px]",
                                                small: "w-1/3 max-w-[254px]",
                                            }[size as ImageSize] ||
                                            "w-full max-w-3xl";

                                        return (
                                            <div className="flex justify-center my-6">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={src}
                                                    alt={altText}
                                                    className={cn(
                                                        sizeClass,
                                                        "rounded-lg",
                                                    )}
                                                />
                                            </div>
                                        );
                                    },
                                    // YouTube embed detection via links
                                    a: ({ href, children }) => {
                                        if (!href) {
                                            return <a>{children}</a>;
                                        }

                                        const videoId = extractYouTubeId(href);
                                        if (videoId) {
                                            return (
                                                <div className="flex justify-center my-8">
                                                    <div className="w-full max-w-3xl aspect-video">
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${videoId}`}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            className="w-full h-full rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                {children}
                                            </a>
                                        );
                                    },
                                    // Center-align tables
                                    table: ({ children }) => (
                                        <div className="flex justify-center my-6">
                                            <table className="border-collapse">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    // Syntax highlighting for code blocks
                                    code: ({
                                        className,
                                        children,
                                        ...props
                                    }) => {
                                        const match = /language-(\w+)/.exec(
                                            className || "",
                                        );
                                        const isInline = !match;

                                        return isInline ? (
                                            <code
                                                className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        ) : (
                                            <div className="my-6">
                                                <SyntaxHighlighter
                                                    style={oneDark as any}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    className="rounded-lg"
                                                >
                                                    {String(children).replace(
                                                        /\n$/,
                                                        "",
                                                    )}
                                                </SyntaxHighlighter>
                                            </div>
                                        );
                                    },
                                }}
                            >
                                {content || "*No content yet...*"}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            {/* Statistics Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span aria-label={`${charCount} characters`}>
                        <span className="font-medium">
                            {charCount.toLocaleString()}
                        </span>{" "}
                        characters
                    </span>
                    <span aria-label={`${wordCount} words`}>
                        <span className="font-medium">
                            {wordCount.toLocaleString()}
                        </span>{" "}
                        words
                    </span>
                    <span aria-label={`${readingTime} minute read time`}>
                        <span className="font-medium">{readingTime}</span> min
                        read
                    </span>
                </div>
                <div className="text-muted-foreground/60">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                        Ctrl+Z
                    </kbd>{" "}
                    to undo,{" "}
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                        Ctrl+Y
                    </kbd>{" "}
                    to redo
                </div>
            </div>

            {/* Link Dialog */}
            <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                        <DialogDescription>
                            Add a link to your content
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="link-text">Link Text</Label>
                            <Input
                                id="link-text"
                                placeholder="Enter link text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="link-url">URL</Label>
                            <Input
                                id="link-url"
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && linkUrl) {
                                        e.preventDefault();
                                        insertLink();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowLinkDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={insertLink} disabled={!linkUrl}>
                            Insert Link
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Table Dialog */}
            <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Insert Table</DialogTitle>
                        <DialogDescription>
                            Create a markdown table with custom dimensions
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="table-rows">
                                Number of Rows (1-10)
                            </Label>
                            <Input
                                id="table-rows"
                                type="number"
                                min="1"
                                max="10"
                                placeholder="3"
                                value={tableRows}
                                onChange={(e) => setTableRows(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="table-cols">
                                Number of Columns (1-10)
                            </Label>
                            <Input
                                id="table-cols"
                                type="number"
                                min="1"
                                max="10"
                                placeholder="3"
                                value={tableCols}
                                onChange={(e) => setTableCols(e.target.value)}
                                onKeyDown={(e) => {
                                    if (
                                        e.key === "Enter" &&
                                        tableRows &&
                                        tableCols
                                    ) {
                                        e.preventDefault();
                                        generateTable();
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowTableDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={generateTable}
                            disabled={!tableRows || !tableCols}
                        >
                            Insert Table
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Find & Replace Dialog */}
            <Dialog open={showFindDialog} onOpenChange={setShowFindDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Find & Replace</DialogTitle>
                        <DialogDescription>
                            Search and replace text in your content
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="find-text">Find</Label>
                            <Input
                                id="find-text"
                                placeholder="Text to find"
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && findText) {
                                        e.preventDefault();
                                        handleFindReplace(false);
                                    }
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="replace-text">Replace with</Label>
                            <Input
                                id="replace-text"
                                placeholder="Replacement text"
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && findText) {
                                        e.preventDefault();
                                        handleFindReplace(false);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowFindDialog(false)}
                        >
                            Close
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleFindReplace(false)}
                            disabled={!findText}
                        >
                            Find Next
                        </Button>
                        <Button
                            onClick={() => handleFindReplace(true)}
                            disabled={!findText}
                        >
                            Replace All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Media Library Modal */}
            <MediaLibraryModal
                open={showMediaLibrary}
                onOpenChange={setShowMediaLibrary}
                onSelect={(url) => insertImageMarkdown(url, selectedSize)}
                selectedSize={selectedSize}
                onSizeChange={setSelectedSize}
            />
        </div>
    );
}
