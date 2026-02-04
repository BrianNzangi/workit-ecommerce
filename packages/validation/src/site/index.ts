import { z } from "zod";

// --- Settings Schemas ---
export const storeSettingSchema = z.object({
    key: z.string().min(1),
    value: z.string().min(1),
    group: z.string().default("general"),
});

export const bulkSettingsSchema = z.record(z.string(), z.any());

export const contactInfoSchema = z.object({
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    whatsapp: z.string().optional(),
});
