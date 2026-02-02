import type { Metadata } from "next";
import { EB_Garamond, Karla, Josefin_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./uploadthing.css";

// Serif for headings - timeless classical elegance
const ebGaramond = EB_Garamond({
    variable: "--font-heading",
    subsets: ["latin"],
    weight: ["400", "600"],
    display: "swap",
});

// Sans-serif for body - clean geometric readability
const karla = Karla({
    variable: "--font-body",
    subsets: ["latin"],
    weight: ["300", "400", "500"],
    display: "swap",
});

// Josefin Sans for article headings - elegant geometric sans
const josefinSans = Josefin_Sans({
    variable: "--font-article-heading",
    subsets: ["latin"],
    weight: ["700"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Amayy's Blog",
        template: "%s | Amayy's Blog",
    },
    description:
        "Latest news, updates and tips. Welcome to the blog, writen by professionals; It's connect people.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${ebGaramond.variable} ${karla.variable} ${josefinSans.variable} font-body antialiased min-h-screen flex flex-col`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
