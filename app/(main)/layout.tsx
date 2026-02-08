import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics } from "@vercel/analytics/next";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Analytics />
            <Navbar />
            <main id="main-content" className="flex-1" role="main">
                {children}
            </main>
            <Footer />
        </>
    );
}
