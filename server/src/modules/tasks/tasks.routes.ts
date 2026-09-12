import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../shared/utils/validate.js";
import * as tasksController from "./tasks.controller.js";
import { assignTaskSchema, createTaskSchema, taskFiltersSchema, updateTaskSchema, updateTaskStatusSchema } from "./tasks.validation.js";

const router = Router();

router.use(authenticate);

router.post( "/projects/:projectId/tasks", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(createTaskSchema), asyncHandler(tasksController.createTask));

router.get( "/projects/:projectId/tasks", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER), validate(taskFiltersSchema, "query"), asyncHandler(tasksController.getTasks));

router.get( "/tasks/:taskId", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER), asyncHandler(tasksController.getTask));

router.patch( "/tasks/:taskId", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(updateTaskSchema), asyncHandler(tasksController.updateTask));

router.patch( "/tasks/:taskId/assign", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), validate(assignTaskSchema), asyncHandler(tasksController.assignTask));

router.patch( "/tasks/:taskId/status", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER), validate(updateTaskStatusSchema), asyncHandler(tasksController.updateTaskStatus));

export default router;