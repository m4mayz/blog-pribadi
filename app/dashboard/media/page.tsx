import { MediaLibraryContent } from "@/components/media-library-content";

export default function MediaLibraryPage() {
    return (
        <div className="p-6 md:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Media Library
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Manage all your uploaded images in one place
                </p>
            </div>

            <MediaLibraryContent />
        </div>
    );
}
