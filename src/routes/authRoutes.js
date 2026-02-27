import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/register", authController.register);
router.get("/verify/:token", authController.verify);
router.get("/verify-email", authController.verify);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgot);
router.post("/reset-password", authController.reset);
router.post("/reset-password/:token", authController.reset);
router.post("/resend-verification", authController.resendVerification);

export default router;
