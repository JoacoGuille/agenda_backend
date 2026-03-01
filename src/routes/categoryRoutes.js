import express from "express";
import * as categoryController from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import {
  categoryIdParamValidator,
  createCategoryValidator,
  updateCategoryValidator
} from "../middleware/validators.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", categoryController.getAllCategories);
router.get(
  "/:id",
  categoryIdParamValidator,
  validateRequest,
  categoryController.getCategoryById
);
router.post(
  "/",
  createCategoryValidator,
  validateRequest,
  categoryController.createCategory
);
router.put(
  "/:id",
  categoryIdParamValidator,
  updateCategoryValidator,
  validateRequest,
  categoryController.updateCategory
);
router.delete(
  "/:id",
  categoryIdParamValidator,
  validateRequest,
  categoryController.deleteCategory
);

export default router;
