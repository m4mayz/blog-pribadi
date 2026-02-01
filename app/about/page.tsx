import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Mail, MapPin, Briefcase } from "lucide-react";

export default function AboutPage() {
    const skills = [
        "TypeScript", "React", "Next.js", "Node.js",
        "Tailwind CSS", "PostgreSQL", "Prisma", "Git"
    ];

    return (
        <div className="min-h-screen pt-32 pb-20">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                        👋 Nice to meet you
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        I'm <span className="gradient-text">Akmal Zaidan</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl">
                        A passionate developer exploring the intersection of technology, design, and user experience. 
                        I build products that matter and share what I learn along the way.
                    </p>
                </div>

                {/* Quick Info */}
                <div className="grid gap-4 md:grid-cols-3 mb-16">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="font-medium">Full-Stack Developer</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">Remote</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                        <Mail className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Contact</p>
                            <p className="font-medium">Available</p>
                        </div>
                    </div>
                </div>

                {/* About Content */}
                <div className="space-y-12">
                    {/* Bio */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6">About Me</h2>
                        <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed">
                            <p>
                                Welcome to my personal blog! I'm a developer who loves building 
                                products that solve real problems. My journey in tech started with 
                                curiosity and has evolved into a passion for creating seamless user experiences.
                            </p>
                            <p>
                                I specialize in modern web development, with expertise in React, Next.js, 
                                and TypeScript. But beyond the code, I'm fascinated by the intersection 
                                of technology and human behavior.
                            </p>
                            <p>
                                This blog is my space to share insights, document my learning journey, 
                                and connect with like-minded people. Whether you're here to learn or 
                                just browsing, I hope you find something valuable!
                            </p>
                        </div>
                    </section>

                    {/* Skills */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6">Tech Stack</h2>
                        <div className="flex flex-wrap gap-3">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Connect */}
                    <section>
                        <h2 className="text-3xl font-bold mb-6">Let's Connect</h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            I'm always open to interesting conversations and collaboration opportunities. 
                            Feel free to reach out on any of these platforms:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button variant="outline" size="lg" asChild>
                                <Link
                                    href="https://github.com/m4mayz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon icon="mdi:github" className="mr-2 h-5 w-5" />
                                    GitHub
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link
                                    href="https://instagram.com/m4mayz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Icon icon="mdi:instagram" className="mr-2 h-5 w-5" />
                                    Instagram
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <Link href="mailto:your@email.com">
                                    <Mail className="mr-2 h-5 w-5" />
                                    Email
                                </Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
