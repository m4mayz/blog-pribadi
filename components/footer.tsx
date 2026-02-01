import Link from "next/link";
import { Icon } from "@iconify/react";

export function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            <div className="container py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Copyright */}
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Akmal Zaidan. All rights
                        reserved.
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="https://github.com/m4mayz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Icon icon="mdi:github" className="h-5 w-5" />
                            <span className="sr-only">GitHub</span>
                        </Link>
                        <Link
                            href="https://instagram.com/m4mayz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Icon icon="mdi:instagram" className="h-5 w-5" />
                            <span className="sr-only">Instagram</span>
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
