"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Add border/shadow when scrolled past threshold
            setIsScrolled(currentScrollY > 20);

            // Show navbar when scrolling up or near top
            if (currentScrollY < lastScrollY || currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide when scrolling down past threshold (150px for better UX)
            else if (currentScrollY > lastScrollY && currentScrollY > 150) {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <header
            role="banner"
            aria-label="Site header"
            className={`
                fixed top-0 left-0 right-0 z-50
                transition-all duration-300 ease-in-out
                ${isVisible ? "translate-y-0" : "-translate-y-full"}
                ${
                    isScrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm support-backdrop-blur:bg-background/60"
                        : "bg-background/60 backdrop-blur-md"
                }
            `}
            style={{
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >
            <nav className="container-compact" aria-label="Main navigation">
                <div className="h-16 flex items-center justify-between">
                    {/* Logo with hover effect */}
                    <Link
                        href="/"
                        aria-label="Amayy's Blog - Home"
                        className="font-heading text-xl font-bold tracking-tight hover:text-primary transition-all duration-200 relative group"
                    >
                        <span className="relative z-10">Amayy&#39;s Blog</span>
                        <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-linear-to-r from-primary to-primary/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>

                    {/* Right section */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle with enhanced styling */}
                        <div className="relative">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
