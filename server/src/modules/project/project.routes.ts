import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../shared/utils/validate.js";
import * as projectsController from "./project.controller.js";
import { createProjectSchema, updateProjectSchema } from "./project.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post( "/", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(createProjectSchema), asyncHandler(projectsController.createProject));

router.get( "/", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), asyncHandler(projectsController.getProjects));

router.get( "/:projectId", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), asyncHandler(projectsController.getProject));

router.patch( "/:projectId", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(updateProjectSchema), asyncHandler(projectsController.updateProject));

router.post( "/:projectId/abandon", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), asyncHandler(projectsController.abandonProject));

export default router;