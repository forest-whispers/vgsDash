import type { RequestHandler } from "express";
import type { ZodObject } from "zod";

export const validateBody = ( schema: ZodObject ): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const formattedErrors = result.error.issues.map((err) => {
                    const field = err.path.join(".") || "body";
                    return {
                        field,
                        message: err.message,
                    }
            })
            res.status(400).json({
                status: "fail",
                errors: formattedErrors,
            });
            return;
        }

        req.body = result.data;
        next();
    };
};