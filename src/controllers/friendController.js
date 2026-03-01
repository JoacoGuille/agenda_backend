import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const toFriendPayload = (friend) => ({
  id: friend._id?.toString?.() ?? friend.id,
  _id: friend._id ?? friend.id,
  name: friend.name,
  email: friend.email
});

const areAlreadyFriends = async (userId, friendId) => {
  const user = await User.findOne({
    _id: userId,
    friends: friendId
  }).select("_id");
  return !!user;
};

export const getFriends = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("friends", "name email");
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const friends = (user.friends || []).map((friend) => toFriendPayload(friend));
    res.json(friends);
  } catch (error) {
    next(error);
  }
};

export const getFriendById = async (req, res, next) => {
  try {
    const friendId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return res.status(404).json({ message: "Amigo no encontrado" });
    }

    const relationship = await User.findOne({
      _id: req.user.id,
      friends: friendId
    }).select("_id");

    if (!relationship) {
      return res.status(404).json({ message: "Amigo no encontrado" });
    }

    const friend = await User.findById(friendId).select("name email");
    if (!friend) {
      return res.status(404).json({ message: "Amigo no encontrado" });
    }

    res.json(toFriendPayload(friend));
  } catch (error) {
    next(error);
  }
};

export const inviteFriend = async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    const senderId = req.user.id;

    const recipientUser = userId
      ? await User.findById(userId)
      : await User.findOne({ email });

    if (!recipientUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (recipientUser._id.toString() === senderId) {
      return res.status(400).json({ message: "No podés invitarte a vos mismo" });
    }

    if (await areAlreadyFriends(senderId, recipientUser._id)) {
      return res.status(400).json({ message: "Ya son amigos" });
    }

    const existingInvite = await Notification.findOne({
      type: "friend_invite",
      status: "pending",
      sender: senderId,
      recipient: recipientUser._id
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitación ya enviada" });
    }

    await Notification.create({
      type: "friend_invite",
      sender: senderId,
      recipient: recipientUser._id,
      message: "Te envió una invitación para compartir su agenda."
    });

    res.json({ message: "Invitación enviada" });
  } catch (error) {
    next(error);
  }
};

export const acceptFriend = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const notification = await Notification.findOne({
      _id: requestId,
      recipient: req.user.id,
      type: "friend_invite"
    });

    if (!notification) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({ message: "Invitación ya procesada" });
    }

    notification.status = "accepted";
    await notification.save();

    await User.updateOne(
      { _id: notification.sender },
      { $addToSet: { friends: notification.recipient } }
    );
    await User.updateOne(
      { _id: notification.recipient },
      { $addToSet: { friends: notification.sender } }
    );

    res.json({ message: "Invitación aceptada" });
  } catch (error) {
    next(error);
  }
};

export const rejectFriend = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const notification = await Notification.findOne({
      _id: requestId,
      recipient: req.user.id,
      type: "friend_invite"
    });

    if (!notification) {
      return res.status(404).json({ message: "Invitación no encontrada" });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({ message: "Invitación ya procesada" });
    }

    notification.status = "rejected";
    await notification.save();

    res.json({ message: "Invitación rechazada" });
  } catch (error) {
    next(error);
  }
};
