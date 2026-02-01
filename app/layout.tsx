import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

// Sans-serif for body text/UI
const geistSans = Geist({
    variable: "--font-sans",
    subsets: ["latin"],
});

// Serif for headings/editorial feel
const playfair = Playfair_Display({
    variable: "--font-serif",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Akmal Zaidan's Blog",
    description: "A digital garden of thoughts and stories.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${playfair.variable} font-sans antialiased min-h-screen flex flex-col`}
            >
                <Providers>
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
