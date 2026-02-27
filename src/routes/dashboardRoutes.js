import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getSummary } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/summary", getSummary);

export default router;
