import crypto from "crypto";
import mongoose from "mongoose";
import {
  addMemberToGroup,
  createGroup,
  deleteGroupById,
  findGroupById,
  findGroupByIdForUser,
  findGroupByInviteToken,
  findGroupsForUser,
  saveGroup
} from "../repositories/groupRepository.js";
import { findUserByEmail, findUserById } from "../repositories/userRepository.js";
import {
  createNotification,
  findGroupInvites,
  findPendingGroupInvite
} from "../repositories/notificationRepository.js";
import { httpError } from "../utils/httpError.js";
import { withMembers } from "../utils/mappers.js";

const buildInviteLink = (token, groupId) => {
  const baseUrl =
    process.env.APP_URL || process.env.API_URL || "http://localhost:4000";
  return `${baseUrl}/grupos/join?token=${token}&groupId=${groupId}`;
};

const resolveGroupId = (value) => {
  const id = (value ?? "").toString().trim();
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return id;
};

const resolveOwnerId = (owner) => {
  if (!owner) return null;
  if (typeof owner === "string") return owner;
  if (owner._id) return owner._id.toString();
  if (owner.id) return owner.id.toString();
  return null;
};

export const getGroupsForUser = async (userId) => {
  const groups = await findGroupsForUser(userId, { populateMembers: true });
  return groups.map(withMembers);
};

export const getGroupByIdForUser = async (userId, groupId, token) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  let group = null;
  if (userId) {
    group = await findGroupByIdForUser(normalizedId, userId, {
      populateMembers: true
    });
  }

  if (!group) {
    const safeToken = (token ?? "").toString().trim();
    if (!safeToken) {
      throw httpError(404, "Grupo no encontrado");
    }
    const invitedGroup = await findGroupByInviteToken(normalizedId, safeToken, {
      populateMembers: true
    });
    if (!invitedGroup) {
      throw httpError(404, "Grupo no encontrado");
    }
    return withMembers(invitedGroup);
  }

  return withMembers(group);
};

export const createGroupForUser = async (userId, payload) => {
  const { name, description = "" } = payload;
  if (!name) {
    throw httpError(400, "El nombre es obligatorio");
  }

  const group = await createGroup({
    name,
    description,
    owner: userId,
    members: [userId]
  });

  return withMembers(group);
};

export const updateGroupForUser = async (userId, groupId, payload) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  const group = await findGroupById(normalizedId, { populateMembers: true });

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  if (resolveOwnerId(group.owner) !== userId) {
    throw httpError(403, "No autorizado");
  }

  const { name, description } = payload;
  if (name !== undefined) group.name = name;
  if (description !== undefined) group.description = description;

  await saveGroup(group);
  return withMembers(group);
};

export const deleteGroupForUser = async (userId, groupId) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  const group = await findGroupById(normalizedId);

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  if (resolveOwnerId(group.owner) !== userId) {
    throw httpError(403, "No autorizado");
  }

  await deleteGroupById(normalizedId);
  return { message: "Grupo eliminado" };
};

export const createInviteLinkForGroup = async (userId, groupId) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  const group = await findGroupByIdForUser(normalizedId, userId);

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  const token = crypto.randomBytes(24).toString("hex");
  group.inviteToken = token;
  await saveGroup(group);

  return { link: buildInviteLink(token, group._id) };
};

export const inviteUserToGroup = async (userId, groupId, payload) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  const group = await findGroupByIdForUser(normalizedId, userId);

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  const { email, userId: targetUserId } = payload;
  const recipientUser = targetUserId
    ? await findUserById(targetUserId)
    : await findUserByEmail(email);

  if (!recipientUser) {
    throw httpError(404, "Usuario no encontrado");
  }

  const isMember = group.members.some(
    (memberId) => memberId.toString() === recipientUser._id.toString()
  );

  if (isMember) {
    throw httpError(400, "El usuario ya es miembro");
  }

  const existingInvite = await findPendingGroupInvite(
    recipientUser._id,
    group._id
  );

  if (existingInvite) {
    throw httpError(400, "Invitación ya enviada");
  }

  await createNotification({
    type: "group_invite",
    sender: userId,
    recipient: recipientUser._id,
    groupId: group._id,
    message: `Te invitaron al grupo ${group.name}.`
  });

  return { message: "Invitación enviada" };
};

export const getGroupInvitesForUser = async (userId, groupId) => {
  const normalizedId = resolveGroupId(groupId);
  if (!normalizedId) {
    throw httpError(404, "Grupo no encontrado");
  }

  const group = await findGroupByIdForUser(normalizedId, userId);

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  const invites = await findGroupInvites(group._id);

  return invites.map((invite) => ({
    id: invite._id,
    status: invite.status,
    createdAt: invite.createdAt,
    sender: invite.sender
      ? {
          id: invite.sender._id,
          name: invite.sender.name,
          email: invite.sender.email
        }
      : null,
    recipient: invite.recipient
      ? {
          id: invite.recipient._id,
          name: invite.recipient.name,
          email: invite.recipient.email
        }
      : null,
    message: invite.message
  }));
};

export const joinGroupByToken = async (userId, token, groupId) => {
  const normalizedId = resolveGroupId(groupId);
  const safeToken = (token ?? "").toString().trim();

  if (!normalizedId || !safeToken) {
    throw httpError(400, "Token y grupo son obligatorios");
  }

  const group = await findGroupByInviteToken(normalizedId, safeToken, {
    populateMembers: true
  });

  if (!group) {
    throw httpError(404, "Grupo no encontrado");
  }

  if (!userId) {
    return { ...withMembers(group), joinRequired: true };
  }

  await addMemberToGroup(group._id, userId);

  const updated = await findGroupById(group._id, { populateMembers: true });
  return withMembers(updated);
};
