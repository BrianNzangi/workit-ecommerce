import { z } from "zod";

// --- Auth Schemas ---
export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
});

export const passwordResetSchema = z.object({
    email: z.string().email("Invalid email address"),
});

export const newPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    token: z.string().min(1, "Token is required"),
});

// --- Customer Schemas ---
export const createCustomerSchema = z.object({
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phoneNumber: z.string().optional(),
    password: z.string().min(8).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
    id: z.string().uuid().optional(),
});

// --- User (Admin) Schemas ---
export const createUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Full name is required"),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "STAFF"]).default("ADMIN"),
    password: z.string().min(8).optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
    id: z.string().uuid().optional(),
});
