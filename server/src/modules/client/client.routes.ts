import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validate } from "../../shared/utils/validate.js";

import * as clientsController from "./client.controller.js";
import { createClientSchema, updateClientSchema } from "./client.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post( "/", checkRole(UserRole.ADMIN), validate(createClientSchema), asyncHandler(clientsController.createClient));

router.get( "/", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), asyncHandler(clientsController.getClients));

router.get( "/:clientId", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER), asyncHandler(clientsController.getClient));

router.patch( "/:clientId", checkRole(UserRole.ADMIN), validate(updateClientSchema), asyncHandler(clientsController.updateClient));

router.delete( "/:clientId", checkRole(UserRole.ADMIN), asyncHandler(clientsController.deleteClient));

export default router;