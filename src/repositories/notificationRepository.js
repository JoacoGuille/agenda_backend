import Notification from "../models/Notification.js";

export const createNotification = (data) => Notification.create(data);

export const findNotificationByIdForRecipient = (id, recipient) =>
  Notification.findOne({ _id: id, recipient });

export const findNotificationsForRecipient = (recipient, status) => {
  const filter = { recipient };
  if (status) {
    filter.status = status;
  } else {
    filter.status = "pending";
  }
  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .populate("sender", "name email")
    .populate("groupId", "name")
    .populate("eventId", "title startAt");
};

export const findPendingFriendInvite = (senderId, recipientId) =>
  Notification.findOne({
    type: "friend_invite",
    status: "pending",
    sender: senderId,
    recipient: recipientId
  });

export const findPendingGroupInvite = (recipientId, groupId) =>
  Notification.findOne({
    type: "group_invite",
    status: "pending",
    recipient: recipientId,
    groupId
  });

export const updateNotification = (notification) => notification.save();

export const markNotificationsRead = (recipient, now) =>
  Notification.updateMany(
    { recipient, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

export const countPendingNotifications = (recipient) =>
  Notification.countDocuments({ recipient, status: "pending" });

export const findGroupInvites = (groupId) =>
  Notification.find({
    groupId,
    type: "group_invite",
    status: "pending"
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name email")
    .populate("recipient", "name email");
