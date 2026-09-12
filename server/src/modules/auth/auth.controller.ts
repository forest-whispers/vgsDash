import type { Request, Response } from "express";

import { constants } from "../../shared/config/constants.js";
import { clearAuthCookies, setAuthCookies } from "../../shared/utils/cookies.js";
import { registerService, loginService, refreshService, logoutService, getMeService } from "./auth.service.js";

export const register = async (req: Request, res: Response) =>
{
    await registerService(req.body);
    return res.status(201).json({
        message: "Registered successfully"
    });
};

export const login = async (req: Request, res: Response) =>
{
    const { accessToken, refreshToken, user } = await loginService(req.body);
    setAuthCookies(res, refreshToken);
    return res.status(200).json({
        accessToken,
        user
    });
};

export const refresh = async (req: Request, res: Response) =>
{
    const refreshToken = req.cookies[constants.REFRESH_COOKIE_NAME];
    const { accessToken, refreshToken: newRefreshToken } = await refreshService(refreshToken);
    setAuthCookies(res, newRefreshToken);
    return res.status(200).json({
        accessToken
    });
};

export const logout = async (req: Request, res: Response) =>
{
    const refreshToken = req.cookies[constants.REFRESH_COOKIE_NAME];
    await logoutService(refreshToken);
    clearAuthCookies(res);
    return res.status(200).json({
        message: "Logged out successfully"
    });
};

export const getMe = async (req: Request, res: Response) =>
{
    const user = await getMeService(req.user!.userId);
    res.status(200).json({ user });
};