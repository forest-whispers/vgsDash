import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { validateBody } from "../../shared/utils/validate.js";

import * as clientsController from "./client.controller.js";
import { createClientSchema, updateClientSchema } from "./client.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate, checkRole(UserRole.ADMIN));

router.post( "/", validateBody(createClientSchema), asyncHandler(clientsController.createClient));

router.get( "/", asyncHandler(clientsController.getClients));

router.get( "/:clientId", asyncHandler(clientsController.getClient));

router.patch( "/:clientId", validateBody(updateClientSchema), asyncHandler(clientsController.updateClient));

router.delete( "/:clientId", asyncHandler(clientsController.deleteClient));

export default router;