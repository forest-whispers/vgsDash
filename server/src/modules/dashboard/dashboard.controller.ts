import type { Request, Response } from "express";
import { getDashboardService } from "./dashboard.service.js";

export const getDashboard = async ( req: Request, res: Response ) =>
{
    const dashboard = await getDashboardService(req.user!);
    res.status(200).json({ dashboard });
};