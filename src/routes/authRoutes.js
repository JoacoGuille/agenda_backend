import express from "express";
import * as authController from "../controllers/authController.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import {
  authForgotValidator,
  authLoginValidator,
  authRegisterValidator,
  authResendValidator,
  authResetValidator
} from "../middleware/validators.js";

const router = express.Router();

router.post("/register", authRegisterValidator, validateRequest, authController.register);
router.get("/verify/:token", authController.verify);
router.get("/verify-email", authController.verify);
router.post("/login", authLoginValidator, validateRequest, authController.login);
router.post(
  "/forgot-password",
  authForgotValidator,
  validateRequest,
  authController.forgot
);
router.post("/reset-password", authResetValidator, validateRequest, authController.reset);
router.post(
  "/reset-password/:token",
  authResetValidator,
  validateRequest,
  authController.reset
);
router.post(
  "/resend-verification",
  authResendValidator,
  validateRequest,
  authController.resendVerification
);

export default router;
