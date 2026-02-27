import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as eventController from "../controllers/eventController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.put("/:id", eventController.updateEvent);
router.delete("/:id", eventController.deleteEvent);

export default router;
