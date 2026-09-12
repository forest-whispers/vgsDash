import type { Request, Response } from "express";

import * as activitiesService from "./activities.service.js";

export const getActivities = async (req: Request, res: Response) => {
        const activities = await activitiesService.getActivitiesService(
            req.user!,
            req.query
        );
        res.status(200).json({ activities });
};