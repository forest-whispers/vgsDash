import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import usersRouter from "../modules/user/user.routes.js";
import clientsRouter from "../modules/client/client.routes.js";
import projectsRouter from "../modules/project/project.routes.js";
import activitiesRouter from "../modules/activities/activities.routes.js";
import notificationsRouter from "../modules/notifications/notifications.routes.js";
import tasksRouter from "../modules/tasks/tasks.routes.js";

export const router = Router();

router.get("/health", (req, res)=>
{
    res.status(200).json({ message: "Server is healthy" });
})

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/clients", clientsRouter);
router.use("/projects", projectsRouter);
router.use("/activities", activitiesRouter);
router.use("/notifications", notificationsRouter);
router.use("/", tasksRouter);