import { z } from "zod";

export const createClientSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().toLowerCase().optional(),
    company: z.string().trim().max(150).optional(),
});

export const updateClientSchema = z.object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().toLowerCase().optional(),
    company: z.string().trim().max(150).optional(),
});