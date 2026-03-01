import express from "express";
import {
  createGroup,
  createInviteLink,
  deleteGroup,
  getGroupById,
  getGroupInvites,
  getGroups,
  inviteToGroup,
  joinGroupByToken,
  updateGroup
} from "../controllers/groupController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/join", joinGroupByToken);
router.get("/:id", optionalAuthMiddleware, getGroupById);

router.use(authMiddleware);
router.get("/", getGroups);
router.post("/join", joinGroupByToken);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);
router.post("/:id/invite-link", createInviteLink);
router.post("/:id/invite", inviteToGroup);
router.get("/:id/invites", getGroupInvites);

export default router;
