import { Router } from "express";

import { authenticate } from "../../shared/middleware/authenticate.js";
import { validate } from "../../shared/utils/validate.js";
import * as notificationsController from "./notifications.controller.js";
import { notificationFiltersSchema } from "./notifications.validation.js";

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get( "/", validate(notificationFiltersSchema, "query"), notificationsController.getNotifications );

router.get( "/unread-count", notificationsController.getUnreadCount );

router.patch( "/read-all", notificationsController.markAllNotificationsRead );

router.patch( "/:notificationId/read", notificationsController.markNotificationRead );

export default router;