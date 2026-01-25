"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogPostSchema = void 0;
const zod_1 = require("zod");
exports.blogPostSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    slug: zod_1.z.string().min(1, "Slug is required").max(255, "Slug must be less than 255 characters").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
    excerpt: zod_1.z.string().optional(),
    content: zod_1.z.string().min(1, "Content is required"),
    featuredImageUrl: zod_1.z.string().refine((val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'), { message: "Must be a valid URL or path" }).optional(),
    author: zod_1.z.string().optional(),
    published: zod_1.z.boolean().default(false),
    publishedAt: zod_1.z.date().optional(),
});
//# sourceMappingURL=blog.js.map