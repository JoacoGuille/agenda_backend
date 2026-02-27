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
      .populate("sender", "name email");

    res.json(notifications);
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

    notification.status = "accepted";
    await notification.save();

    if (notification.type === "friend_invite") {
      await acceptFriendInvite(notification);
    }

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
    await notification.save();

    res.json({ message: "Notificación rechazada" });
  } catch (error) {
    next(error);
  }
};
