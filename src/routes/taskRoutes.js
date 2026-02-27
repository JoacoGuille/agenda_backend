import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as taskController from "../controllers/taskController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);

export default router;
