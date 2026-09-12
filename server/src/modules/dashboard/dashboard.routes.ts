import { Router } from "express";

import { getDashboard } from "./dashboard.controller.js";
import { authenticate } from "../../shared/middleware/authenticate.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const router = Router();

router.get("/", authenticate, asyncHandler(getDashboard));

export default router;