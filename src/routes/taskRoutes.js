import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as taskController from "../controllers/taskController.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import { createTaskValidator } from "../middleware/validators.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", taskController.getAllTasks);
router.post("/", createTaskValidator, validateRequest, taskController.createTask);

export default router;
