import Link from "next/link";
import { auth, signOut } from "@/auth";
import { AuthModal } from "@/components/auth-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function Navbar() {
    const session = await auth();
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50">
            <div className="mx-auto max-w-5xl mt-6 px-6">
                <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-6 h-14 flex items-center justify-between shadow-sm">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-serif text-lg font-bold tracking-tight"
                    >
                        Akmal Zaidan&apos;s Blog
                        <span className="text-primary">.</span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link
                            href="/"
                            className="hover:text-foreground transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/blog"
                            className="hover:text-foreground transition-colors"
                        >
                            Writing
                        </Link>
                        <Link
                            href="/about"
                            className="hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                    </div>

                    {/* Auth + Theme */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {!session ? (
                            <AuthModal />
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="relative h-8 w-8 rounded-full"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={session.user?.image || ""}
                                                alt={session.user?.name || ""}
                                            />
                                            <AvatarFallback>
                                                {session.user?.name?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56"
                                    align="end"
                                    forceMount
                                >
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium">
                                                {session.user?.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {isAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard">
                                                Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <form
                                            action={async () => {
                                                "use server";
                                                await signOut();
                                            }}
                                        >
                                            <button className="w-full text-left text-red-600">
                                                Sign Out
                                            </button>
                                        </form>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
