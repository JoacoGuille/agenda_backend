import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  acceptFriend,
  getFriends,
  inviteFriend,
  rejectFriend
} from "../controllers/friendController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getFriends);
router.post("/invite", inviteFriend);
router.post("/accept", acceptFriend);
router.post("/reject", rejectFriend);

export default router;
