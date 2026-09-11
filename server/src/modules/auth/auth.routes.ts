import { Router } from "express";

import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validateBody } from "../../shared/utils/validate.js";
import { register, login, refresh, logout } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post( "/register", validateBody(registerSchema), asyncHandler(register));

router.post( "/login", validateBody(loginSchema), asyncHandler(login));

router.post( "/refresh", asyncHandler(refresh));

router.post( "/logout", asyncHandler(logout));

export default router;