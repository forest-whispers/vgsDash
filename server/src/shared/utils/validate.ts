import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type ValidateType = "body" | "query" | "params";

export const validate = <T extends ZodType>(
    schema: T,
    validateType: ValidateType = "body",
): RequestHandler => {
    return (req, res, next) => {
        const result = schema.safeParse(req[validateType]);

        if (!result.success) {
            const formattedErrors = result.error.issues.map((err) => {
                const field = err.path.join(".") || validateType;

                return {
                    field,
                    message: err.message,
                };
            });

            res.status(400).json({
                status: "fail",
                errors: formattedErrors,
            });

            return;
        }

        if (validateType === "query") {
            Object.assign(req.query, result.data);
        } else {
            req[validateType] = result.data;
        }
        next();
    };
};