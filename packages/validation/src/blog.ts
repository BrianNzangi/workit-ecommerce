import { z } from "zod";

export const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    slug: z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
    excerpt: z.string().optional(),
    content: z.string().min(1, "Content is required"),
    featuredImageUrl: z.string().refine(
        (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
        { message: "Must be a valid URL or path" }
    ).optional(),
    author: z.string().optional(),
    published: z.boolean().default(false),
    publishedAt: z.date().optional(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
