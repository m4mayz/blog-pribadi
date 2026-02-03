import Link from "next/link";
import { Icon } from "@iconify/react";

export function Footer() {
    return (
        <footer
            className="border-t py-8 mt-20"
            role="contentinfo"
            aria-label="Site footer"
        >
            <div className="container-compact flex flex-col max-md:text-center md:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <p className="text-sm text-muted-foreground order-2 md:order-1">
                    © {new Date().getFullYear()} Akmal Zaidan. All rights
                    reserved.
                </p>

                {/* Connect */}
                <div className="flex items-center gap-4 order-1 md:order-2">
                    <p className="text-sm font-medium hidden md:block">
                        Connect with Me:
                    </p>
                    <div className="flex items-center gap-3">
                        <Link
                            href="https://akmalzaidan.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Personal Web"
                        >
                            <Icon icon="mdi:web" className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://linkedin.com/in/m4mayz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Icon icon="mdi:linkedin" className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://instagram.com/m4mayz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Instagram"
                        >
                            <Icon icon="mdi:instagram" className="h-5 w-5" />
                        </Link>
                        <Link
                            href="https://github.com/m4mayz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="GitHub"
                        >
                            <Icon icon="mdi:github" className="h-5 w-5" />
                        </Link>
                        <Link
                            href="mailto:akmalzaidan960@gmail.com"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label="Email"
                        >
                            <Icon icon="mdi:email" className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
