import { z } from "zod";

// Comment validation schema
export const commentSchema = z.object({
    content: z
        .string()
        .min(1, "Comment cannot be empty")
        .max(5000, "Comment must be less than 5000 characters")
        .trim(),
    postId: z.string().cuid("Invalid post ID"),
});

export type CommentInput = z.infer<typeof commentSchema>;

// Post validation schemas
export const postSchema = z.object({
    title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title must be less than 200 characters")
        .trim(),
    slug: z
        .string()
        .min(1, "Slug is required")
        .max(200, "Slug must be less than 200 characters")
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug must be lowercase alphanumeric with hyphens only",
        )
        .trim(),
    excerpt: z
        .string()
        .max(500, "Excerpt must be less than 500 characters")
        .optional(),
    content: z.string().min(1, "Content is required"),
    thumbnail: z.string().url("Thumbnail must be a valid URL"),
    published: z.boolean().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
