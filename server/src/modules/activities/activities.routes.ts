import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { checkRole } from "../../shared/middleware/authorize.js";
import { validate } from "../../shared/utils/validate.js";
import * as activitiesController from "./activities.controller.js";
import { activityFiltersSchema } from "./activities.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get( "/", checkRole(UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER), validate(activityFiltersSchema, "query"), activitiesController.getActivities );

export default router;