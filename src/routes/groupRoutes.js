import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createGroup,
  createInviteLink,
  deleteGroup,
  getGroupById,
  getGroupInvites,
  getGroups,
  inviteToGroup,
  updateGroup
} from "../controllers/groupController.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getGroups);
router.get("/:id", getGroupById);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:id/invite-link", createInviteLink);
router.post("/:id/invite", inviteToGroup);
router.get("/:id/invites", getGroupInvites);

export default router;
