import User from "../models/User.js";

export const createUser = (data) => User.create(data);

export const findUserByEmail = (email) => User.findOne({ email });

export const findUserById = (id) => User.findById(id);

export const findUserByIdWithFriends = (id) =>
  User.findById(id).populate("friends", "name email");

export const findUserByVerificationToken = (token) =>
  User.findOne({ verificationToken: token });

export const findUserByResetToken = (token) =>
  User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });

export const updateUserById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true });

export const areFriends = (userId, friendId) =>
  User.findOne({ _id: userId, friends: friendId }).select("_id");

export const addFriend = (userId, friendId) =>
  User.updateOne({ _id: userId }, { $addToSet: { friends: friendId } });
