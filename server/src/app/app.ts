import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { router } from "./routes.js";
import { errorHandler } from "../shared/errors/errorHandler.js";
import { NotFoundError } from "../shared/errors/errors.js";

const app=express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://vgs-dash.vercel.app",
    "https://vgs-dash-git-main-forest-whispers-projects.vercel.app",
    "https://vgs-dash-r8k849wtw-forest-whispers-projects.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }),
);

app.use(morgan("dev"));

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