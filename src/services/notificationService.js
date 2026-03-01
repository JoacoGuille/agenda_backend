import {
  findNotificationByIdForRecipient,
  findNotificationsForRecipient,
  markNotificationsRead,
  updateNotification
} from "../repositories/notificationRepository.js";
import { addFriend } from "../repositories/userRepository.js";
import { addMemberToGroup, findGroupById } from "../repositories/groupRepository.js";
import { httpError } from "../utils/httpError.js";

const acceptFriendInvite = async (notification) => {
  if (!notification.sender || !notification.recipient) return;
  await addFriend(notification.sender, notification.recipient);
  await addFriend(notification.recipient, notification.sender);
};

export const getNotificationsForUser = async (userId, status) => {
  const notifications = await findNotificationsForRecipient(userId, status);

  return notifications.map((notification) => ({
    id: notification._id,
    type: notification.type,
    status: notification.status,
    isRead: notification.isRead,
    readAt: notification.readAt,
    message: notification.message,
    createdAt: notification.createdAt,
    sender: notification.sender
      ? {
          id: notification.sender._id,
          name: notification.sender.name,
          email: notification.sender.email
        }
      : null,
    group: notification.groupId
      ? { id: notification.groupId._id, name: notification.groupId.name }
      : null,
    event: notification.eventId
      ? {
          id: notification.eventId._id,
          title: notification.eventId.title,
          startAt: notification.eventId.startAt
        }
      : null
  }));
};

export const acceptNotificationForUser = async (userId, notificationId) => {
  const notification = await findNotificationByIdForRecipient(
    notificationId,
    userId
  );

  if (!notification) {
    throw httpError(404, "Notificación no encontrada");
  }

  if (notification.status !== "pending") {
    throw httpError(400, "Notificación ya procesada");
  }

  if (notification.type === "friend_invite") {
    await acceptFriendInvite(notification);
  }

  if (notification.type === "group_invite") {
    if (!notification.groupId) {
      throw httpError(400, "Invitación inválida");
    }

    const group = await findGroupById(notification.groupId);
    if (!group) {
      throw httpError(404, "Grupo no encontrado");
    }

    await addMemberToGroup(group._id, notification.recipient);
  }

  notification.status = "accepted";
  notification.isRead = true;
  notification.readAt = new Date();
  await updateNotification(notification);

  return { message: "Notificación aceptada" };
};

export const rejectNotificationForUser = async (userId, notificationId) => {
  const notification = await findNotificationByIdForRecipient(
    notificationId,
    userId
  );

  if (!notification) {
    throw httpError(404, "Notificación no encontrada");
  }

  if (notification.status !== "pending") {
    throw httpError(400, "Notificación ya procesada");
  }

  notification.status = "rejected";
  notification.isRead = true;
  notification.readAt = new Date();
  await updateNotification(notification);

  return { message: "Notificación rechazada" };
};

export const markAllNotificationsReadForUser = async (userId) => {
  const now = new Date();
  const result = await markNotificationsRead(userId, now);

  return {
    message: "Notificaciones actualizadas",
    updated: result.modifiedCount ?? result.nModified ?? 0
  };
};
