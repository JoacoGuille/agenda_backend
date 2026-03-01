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
import { validateRequest } from "../middleware/validateMiddleware.js";
import {
  createGroupValidator,
  groupIdParamValidator,
  inviteGroupValidator,
  joinGroupValidator,
  updateGroupValidator
} from "../middleware/validators.js";

const router = express.Router();

router.get("/join", joinGroupValidator, validateRequest, joinGroupByToken);
router.get(
  "/:id",
  optionalAuthMiddleware,
  groupIdParamValidator,
  validateRequest,
  getGroupById
);

router.use(authMiddleware);
router.get("/", getGroups);
router.post("/join", joinGroupValidator, validateRequest, joinGroupByToken);
router.post("/", createGroupValidator, validateRequest, createGroup);
router.put(
  "/:id",
  groupIdParamValidator,
  updateGroupValidator,
  validateRequest,
  updateGroup
);
router.delete(
  "/:id",
  groupIdParamValidator,
  validateRequest,
  deleteGroup
);
router.post(
  "/:id/invite-link",
  groupIdParamValidator,
  validateRequest,
  createInviteLink
);
router.post(
  "/:id/invite",
  groupIdParamValidator,
  inviteGroupValidator,
  validateRequest,
  inviteToGroup
);
router.get(
  "/:id/invites",
  groupIdParamValidator,
  validateRequest,
  getGroupInvites
);

export default router;
