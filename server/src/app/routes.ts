import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import usersRouter from "../modules/user/user.routes.js";
import clientsRouter from "../modules/client/client.routes.js";

export const router = Router();

router.get("/health", (req, res)=>
{
    res.status(200).json({ message: "Server is healthy" });
})

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/clients", clientsRouter);