import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  acceptNotification,
  getNotifications,
  rejectNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getNotifications);
router.post("/:id/accept", acceptNotification);
router.post("/:id/reject", rejectNotification);

export default router;
