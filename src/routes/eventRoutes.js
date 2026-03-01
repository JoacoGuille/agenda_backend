import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as eventController from "../controllers/eventController.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import {
  createEventValidator,
  eventIdParamValidator,
  updateEventValidator
} from "../middleware/validators.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", eventController.getEvents);
router.get(
  "/:id",
  eventIdParamValidator,
  validateRequest,
  eventController.getEventById
);
router.post(
  "/",
  createEventValidator,
  validateRequest,
  eventController.createEvent
);
router.put(
  "/:id",
  eventIdParamValidator,
  updateEventValidator,
  validateRequest,
  eventController.updateEvent
);
router.delete(
  "/:id",
  eventIdParamValidator,
  validateRequest,
  eventController.deleteEvent
);

export default router;
