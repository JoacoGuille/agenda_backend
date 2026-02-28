import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const acceptFriendInvite = async (notification) => {
  if (!notification.sender || !notification.recipient) return;
  await User.updateOne(
    { _id: notification.sender },
    { $addToSet: { friends: notification.recipient } }
  );
  await User.updateOne(
    { _id: notification.recipient },
    { $addToSet: { friends: notification.sender } }
  );
};

export const getNotifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { recipient: req.user.id };
    if (status) {
      filter.status = status;
    } else {
      filter.status = "pending";
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("groupId", "name")
      .populate("eventId", "title startAt");

    const payload = notifications.map((notification) => ({
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

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const acceptNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({ message: "Notificación ya procesada" });
    }

    if (notification.type === "friend_invite") {
      await acceptFriendInvite(notification);
    }

    if (notification.type === "group_invite") {
      if (!notification.groupId) {
        return res.status(400).json({ message: "Invitación inválida" });
      }

      const group = await Group.findById(notification.groupId);
      if (!group) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      await Group.updateOne(
        { _id: group._id },
        { $addToSet: { members: notification.recipient } }
      );
    }

    notification.status = "accepted";
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: "Notificación aceptada" });
  } catch (error) {
    next(error);
  }
};

export const rejectNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({ message: "Notificación ya procesada" });
    }

    notification.status = "rejected";
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: "Notificación rechazada" });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true, readAt: now } }
    );

    res.json({
      message: "Notificaciones actualizadas",
      updated: result.modifiedCount ?? result.nModified ?? 0
    });
  } catch (error) {
    next(error);
  }
};
