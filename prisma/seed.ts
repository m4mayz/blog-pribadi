import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
    {
        slug: "getting-started-with-nextjs",
        title: "Getting Started with Next.js 15",
        excerpt:
            "Learn how to build modern web applications with Next.js 15 and React Server Components.",
        thumbnail:
            "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop",
        content: `# Getting Started with Next.js 15

Next.js 15 brings exciting new features and improvements to the React framework we all love.

## What's New

- **React Server Components** - Build faster apps with server-side rendering
- **Turbopack** - Lightning fast bundler for development
- **Partial Prerendering** - Best of static and dynamic

## Installation

\`\`\`bash
npx create-next-app@latest my-app
\`\`\`

## Conclusion

Next.js 15 is a game-changer for web development. Give it a try!`,
        published: true,
    },
    {
        slug: "mastering-typescript",
        title: "Mastering TypeScript for React Developers",
        excerpt:
            "A comprehensive guide to using TypeScript effectively in your React projects.",
        thumbnail:
            "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&h=630&fit=crop",
        content: `# Mastering TypeScript for React

TypeScript adds type safety to JavaScript, making your code more robust.

## Why TypeScript?

1. **Catch errors early** - Find bugs before runtime
2. **Better IDE support** - Autocomplete and refactoring
3. **Self-documenting code** - Types serve as documentation

## Basic Types

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const user: User = {
  id: "1",
  name: "John",
  email: "john@example.com"
};
\`\`\`

Happy coding!`,
        published: true,
    },
    {
        slug: "tailwind-css-best-practices",
        title: "Tailwind CSS Best Practices",
        excerpt:
            "Tips and tricks for writing clean, maintainable Tailwind CSS.",
        thumbnail:
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&h=630&fit=crop",
        content: `# Tailwind CSS Best Practices

Tailwind CSS is a utility-first CSS framework that can lead to very clean code.

## Keep It Organized

- Group related utilities together
- Use consistent ordering (layout → sizing → spacing → colors)
- Extract components for repeated patterns

## Example

\`\`\`html
<button class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
  Click me
</button>
\`\`\`

## Conclusion

Tailwind makes styling fast and consistent!`,
        published: true,
    },
    {
        slug: "react-server-components",
        title: "Understanding React Server Components",
        excerpt:
            "Deep dive into React Server Components and how they change the game.",
        thumbnail:
            "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=630&fit=crop",
        content: `# Understanding React Server Components

Server Components are a new paradigm in React development.

## Benefits

- **Smaller bundle size** - Components run on server only
- **Direct database access** - No API layer needed
- **Better performance** - Less JavaScript to the client

## When to Use

Use Server Components for:
- Data fetching
- Accessing backend resources
- Keeping sensitive data on server

Use Client Components for:
- Interactivity (onClick, onChange)
- Browser APIs
- State management`,
        published: true,
    },
    {
        slug: "building-a-blog-with-nextjs",
        title: "Building a Blog with Next.js and Prisma",
        excerpt:
            "Step-by-step guide to creating a full-stack blog application.",
        thumbnail:
            "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop",
        content: `# Building a Blog with Next.js and Prisma

In this tutorial, we'll build a complete blog from scratch.

## Tech Stack

- Next.js 15
- Prisma ORM
- PostgreSQL
- shadcn/ui

## Features

1. Markdown support
2. Comments system
3. Admin dashboard
4. Authentication

Stay tuned for the full tutorial!`,
        published: true,
    },
    {
        slug: "authentication-with-nextauth",
        title: "Authentication with NextAuth.js v5",
        excerpt:
            "Implement secure authentication in your Next.js applications.",
        thumbnail:
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=630&fit=crop",
        content: `# Authentication with NextAuth.js v5

NextAuth.js makes authentication simple and secure.

## Setup

\`\`\`bash
npm install next-auth@beta
\`\`\`

## Configuration

Create \`auth.ts\`:

\`\`\`typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  providers: [GitHub],
});
\`\`\`

Secure your routes easily!`,
        published: true,
    },
    {
        slug: "prisma-orm-guide",
        title: "Complete Guide to Prisma ORM",
        excerpt:
            "Everything you need to know about Prisma for Node.js development.",
        thumbnail:
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&h=630&fit=crop",
        content: `# Complete Guide to Prisma ORM

Prisma is a modern database toolkit for TypeScript and Node.js.

## Why Prisma?

- Type-safe database queries
- Auto-generated client
- Visual database browser (Prisma Studio)

## Schema Example

\`\`\`prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
}
\`\`\`

Start building with Prisma today!`,
        published: true,
    },
    {
        slug: "deploying-to-vercel",
        title: "Deploying Next.js to Vercel",
        excerpt: "The easiest way to deploy your Next.js application.",
        thumbnail:
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop",
        content: `# Deploying Next.js to Vercel

Vercel is the creators of Next.js and offers seamless deployment.

## Steps

1. Push your code to GitHub
2. Connect your repo to Vercel
3. Configure environment variables
4. Deploy!

## Tips

- Use preview deployments for PRs
- Set up custom domains
- Monitor with Vercel Analytics

Your app will be live in minutes!`,
        published: true,
    },
    {
        slug: "shadcn-ui-components",
        title: "Building UIs with shadcn/ui",
        excerpt:
            "Beautiful, accessible components for your React applications.",
        thumbnail:
            "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=630&fit=crop",
        content: `# Building UIs with shadcn/ui

shadcn/ui provides copy-paste components that you own.

## Installation

\`\`\`bash
npx shadcn@latest init
npx shadcn@latest add button card
\`\`\`

## Why shadcn/ui?

- Full control over code
- Accessible by default
- Beautiful design
- Customizable with CSS variables

Build stunning interfaces!`,
        published: true,
    },
    {
        slug: "draft-post-example",
        title: "This is a Draft Post",
        excerpt:
            "This post is not published yet and only visible in dashboard.",
        thumbnail:
            "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop",
        content: `# Draft Post

This is a draft post that hasn't been published yet.

Only admins can see this in the dashboard.

## TODO

- [ ] Add more content
- [ ] Add images
- [ ] Review and publish`,
        published: false,
    },
];

async function main() {
    console.log("🌱 Seeding database...");

    // Delete existing posts
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();

    // Create posts
    for (const post of posts) {
        await prisma.post.create({
            data: post,
        });
        console.log(`✓ Created: ${post.title}`);
    }

    console.log("\n✅ Seeding complete! Created", posts.length, "posts.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
