import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(
            2,
            "Name must contain at least 2 characters.",
        )
        .max(100, "Name cannot exceed 100 characters."),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .toLowerCase(),

    password: z
        .string()
        .min(
            8,
            "Password must contain at least 8 characters.",
        )
        .max(128, "Password cannot exceed 128 characters."),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .email("Please enter a valid email address.")
        .toLowerCase(),

    password: z
        .string()
        .min(
            8,
            "Password must contain at least 8 characters.",
        ),
});