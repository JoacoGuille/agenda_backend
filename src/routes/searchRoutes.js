import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { searchAll } from "../controllers/searchController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", searchAll);

export default router;
