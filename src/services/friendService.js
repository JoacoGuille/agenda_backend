import mongoose from "mongoose";
import {
  addFriend,
  areFriends,
  findUserByEmail,
  findUserById,
  findUserByIdWithFriends
} from "../repositories/userRepository.js";
import {
  createNotification,
  findPendingFriendInvite,
  findNotificationByIdForRecipient,
  updateNotification
} from "../repositories/notificationRepository.js";
import { httpError } from "../utils/httpError.js";
import { toUserPayload } from "../utils/mappers.js";

export const getFriendsForUser = async (userId) => {
  const user = await findUserByIdWithFriends(userId);
  if (!user) {
    throw httpError(404, "Usuario no encontrado");
  }
  return (user.friends || []).map((friend) => toUserPayload(friend));
};

export const getFriendByIdForUser = async (userId, friendId) => {
  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw httpError(404, "Amigo no encontrado");
  }

  const relationship = await areFriends(userId, friendId);
  if (!relationship) {
    throw httpError(404, "Amigo no encontrado");
  }

  const friend = await findUserById(friendId);
  if (!friend) {
    throw httpError(404, "Amigo no encontrado");
  }

  return toUserPayload(friend);
};

export const inviteFriendForUser = async (userId, payload) => {
  const { email, userId: targetUserId } = payload;
  const recipientUser = targetUserId
    ? await findUserById(targetUserId)
    : await findUserByEmail(email);

  if (!recipientUser) {
    throw httpError(404, "Usuario no encontrado");
  }

  if (recipientUser._id.toString() === userId) {
    throw httpError(400, "No podés invitarte a vos mismo");
  }

  if (await areFriends(userId, recipientUser._id)) {
    throw httpError(400, "Ya son amigos");
  }

  const existingInvite = await findPendingFriendInvite(
    userId,
    recipientUser._id
  );

  if (existingInvite) {
    throw httpError(400, "Invitación ya enviada");
  }

  await createNotification({
    type: "friend_invite",
    sender: userId,
    recipient: recipientUser._id,
    message: "Te envió una invitación para compartir su agenda."
  });

  return { message: "Invitación enviada" };
};

export const acceptFriendInviteForUser = async (userId, requestId) => {
  const notification = await findNotificationByIdForRecipient(requestId, userId);

  if (!notification || notification.type !== "friend_invite") {
    throw httpError(404, "Invitación no encontrada");
  }

  if (notification.status !== "pending") {
    throw httpError(400, "Invitación ya procesada");
  }

  notification.status = "accepted";
  await updateNotification(notification);

  await addFriend(notification.sender, notification.recipient);
  await addFriend(notification.recipient, notification.sender);

  return { message: "Invitación aceptada" };
};

export const rejectFriendInviteForUser = async (userId, requestId) => {
  const notification = await findNotificationByIdForRecipient(requestId, userId);

  if (!notification || notification.type !== "friend_invite") {
    throw httpError(404, "Invitación no encontrada");
  }

  if (notification.status !== "pending") {
    throw httpError(400, "Invitación ya procesada");
  }

  notification.status = "rejected";
  await updateNotification(notification);

  return { message: "Invitación rechazada" };
};
