import {
  acceptNotificationForUser,
  getNotificationsForUser,
  markAllNotificationsReadForUser,
  rejectNotificationForUser
} from "../services/notificationService.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotificationsForUser(
      req.user.id,
      req.query.status
    );
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const acceptNotification = async (req, res, next) => {
  try {
    const result = await acceptNotificationForUser(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectNotification = async (req, res, next) => {
  try {
    const result = await rejectNotificationForUser(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    const result = await markAllNotificationsReadForUser(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
