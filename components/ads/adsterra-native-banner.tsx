"use client";

import { useEffect, useRef } from "react";

export function AdsterraNativeBanner() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !containerRef.current) return;
        
        const currentRef = containerRef.current;

        // Clear container in case of re-mount over React Router navigations
        currentRef.innerHTML = "";

        // Create the Div required by Adsterra
        const adDiv = document.createElement("div");
        adDiv.id = "container-2bf555bbb5dd2480d825a4f500f4e27b";
        currentRef.appendChild(adDiv);

        // Create the script tag
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.setAttribute("data-cfasync", "false");
        script.src = "https://pl28943030.profitablecpmratenetwork.com/2bf555bbb5dd2480d825a4f500f4e27b/invoke.js";
        
        // Append the script inside our container
        currentRef.appendChild(script);

        return () => {
            if (currentRef) {
                currentRef.innerHTML = "";
            }
        };
    }, []);

    return (
        <div className="w-full flex justify-center items-center my-6 min-h-12.5 overflow-hidden">
            <div ref={containerRef} />
        </div>
    );
}
