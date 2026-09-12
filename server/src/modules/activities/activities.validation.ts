import { z } from "zod";

export const activityFiltersSchema = z.object({
    limit: z.coerce.number().int().min(1).max(20).default(20),
});