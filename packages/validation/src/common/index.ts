import { z } from "zod";

export const paginationSchema = z.object({
    take: z.number().int().min(1).max(100).default(50),
    skip: z.number().int().min(0).default(0),
});

export const searchSchema = z.object({
    q: z.string().min(1),
});

export const idSchema = z.object({
    id: z.string().uuid("Invalid unique identifier"),
});

export const slugSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
});

export const dateRangeSchema = z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
}).refine(data => {
    if (data.from && data.to) {
        return new Date(data.from) <= new Date(data.to);
    }
    return true;
}, { message: "Start date must be before or equal to end date" });
