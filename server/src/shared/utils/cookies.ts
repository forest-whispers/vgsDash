import type { Response } from "express";
import { constants } from "../config/constants.js";
import { env } from "../config/env.js";

const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: (env.NODE_ENV === "production") ? "none" : "lax",
    path: constants.REFRESH_COOKIE_PATH
} as const;

export const setAuthCookies = (res: Response, refreshToken: string) => {
    res.cookie(
        constants.REFRESH_COOKIE_NAME,
        refreshToken,
        {
            ...cookieOptions,
            maxAge: constants.REFRESH_COOKIE_MAX_AGE
        }
    );
};

export const clearAuthCookies = (res: Response) => {
    res.clearCookie(constants.REFRESH_COOKIE_NAME, cookieOptions);
};