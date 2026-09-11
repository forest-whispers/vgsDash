import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "../shared/config/env.js";
import { router } from "./routes.js";
import { errorHandler } from "../shared/errors/errorHandler.js";
import { NotFoundError } from "../shared/errors/errors.js";

const app=express();

app.use(cors({
    origin: env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", router);

app.use((req, _res, next)=>
{
    next(new NotFoundError(`The requested URL ${req.originalUrl} was not found on this server.`));
})

app.use(errorHandler);

export default app;