import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  acceptFriend,
  getFriends,
  getFriendById,
  inviteFriend,
  rejectFriend
} from "../controllers/friendController.js";
import { validateRequest } from "../middleware/validateMiddleware.js";
import {
  friendIdParamValidator,
  friendRequestValidator,
  inviteFriendValidator
} from "../middleware/validators.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getFriends);
router.get("/:id", friendIdParamValidator, validateRequest, getFriendById);
router.post("/invite", inviteFriendValidator, validateRequest, inviteFriend);
router.post("/accept", friendRequestValidator, validateRequest, acceptFriend);
router.post("/reject", friendRequestValidator, validateRequest, rejectFriend);

export default router;
