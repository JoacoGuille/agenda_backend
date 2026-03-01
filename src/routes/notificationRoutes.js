import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  acceptNotification,
  getNotifications,
  markAllRead,
  rejectNotification
} from "../controllers/notificationController.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { notificationIdParamValidator } from "../middleware/validators.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.post(
  "/:id/accept",
  notificationIdParamValidator,
  validateRequest,
  acceptNotification
);
router.post(
  "/:id/reject",
  notificationIdParamValidator,
  validateRequest,
  rejectNotification
);
router.post("/mark-all-read", markAllRead);

export default router;
