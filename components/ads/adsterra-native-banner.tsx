"use client";

export function AdsterraNativeBanner() {
    return (
        <div className="w-full flex justify-center items-center my-6 overflow-hidden">
            <iframe
                title="Advertisement"
                src="/adsterra-banner.html"
                width="100%"
                className="w-full max-w-4xl border-0 overflow-hidden"
                scrolling="no"
                sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-same-origin"
            />
        </div>
    );
}
