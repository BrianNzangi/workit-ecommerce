import { z } from "zod";
export declare const blogPostSchema: z.ZodObject<{
    title: z.ZodString;
    slug: z.ZodString;
    excerpt: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    featuredImageUrl: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    published: z.ZodDefault<z.ZodBoolean>;
    publishedAt: z.ZodOptional<z.ZodDate>;
}, z.core.$strip>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
