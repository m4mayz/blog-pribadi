"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { MediaLibraryContent } from "@/components/media-library-content";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ImageSize = "large" | "medium" | "small";

interface MediaLibraryModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
    selectedSize?: ImageSize;
    onSizeChange?: (size: ImageSize) => void;
}

export function MediaLibraryModal({
    open,
    onOpenChange,
    onSelect,
    selectedSize = "large",
    onSizeChange,
}: MediaLibraryModalProps) {
    const handleSelect = (url: string) => {
        onSelect(url);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[85vw] w-full min-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Media Library
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm text-muted-foreground">
                        Upload new images or select from existing media
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1">
                    <MediaLibraryContent
                        onSelect={handleSelect}
                        selectable={true}
                        selectedSize={selectedSize}
                        onSizeChange={onSizeChange}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
