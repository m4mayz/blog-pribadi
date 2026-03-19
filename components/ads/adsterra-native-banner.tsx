"use client";

import { useEffect, useState } from "react";

export function AdsterraNativeBanner() {
    const [height, setHeight] = useState(60); // Default minimum height

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'adsterra-resize' && event.data?.height) {
                // Determine actual height
                const newHeight = event.data.height;
                // Add a small buffer just in case, but usually exact height works
                setHeight(newHeight);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div 
            className="w-full flex justify-center items-center my-6 overflow-hidden transition-all duration-300"
            style={{ height: `${height}px` }}
        >
            <iframe
                title="Advertisement"
                src="/adsterra-banner.html"
                width="100%"
                height="100%"
                className="w-full max-w-4xl border-0 overflow-hidden"
                scrolling="no"
                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-same-origin"
            />
        </div>
    );
}
