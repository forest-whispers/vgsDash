import { randomBytes } from "crypto";

export const generateRefreshToken = (): string =>
{
    return randomBytes(32).toString("hex");
};