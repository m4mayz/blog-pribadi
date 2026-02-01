import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 container">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground leading-[0.9]">
                    Digital{" "}
                    <span className="italic text-muted-foreground">
                        Garden.
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                    A collection of thoughts, stories, and experiments. Curated
                    for the curious mind.
                </p>
                <div className="flex items-center justify-center pt-8">
                    <Button
                        size="lg"
                        className="rounded-full px-8 h-12 text-lg"
                        asChild
                    >
                        <Link href="/blog">Start Reading</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
