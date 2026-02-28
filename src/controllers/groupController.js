import crypto from "crypto";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const buildInviteLink = (token, groupId) => {
  const baseUrl =
    process.env.APP_URL || process.env.API_URL || "http://localhost:4000";
  return `${baseUrl}/grupos/join?token=${token}&groupId=${groupId}`;
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user.id }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user.id
    });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const { name, description = "" } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const group = await Group.create({
      name,
      description,
      owner: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const { name, description } = req.body;
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    res.json({ message: "Grupo eliminado" });
  } catch (error) {
    next(error);
  }
};

export const createInviteLink = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    group.inviteToken = token;
    await group.save();

    res.json({ link: buildInviteLink(token, group._id) });
  } catch (error) {
    next(error);
  }
};

export const inviteToGroup = async (req, res, next) => {
  try {
    const { email, userId } = req.body;

    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const recipientUser = userId
      ? await User.findById(userId)
      : await User.findOne({ email });

    if (!recipientUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMember = group.members.some(
      (memberId) => memberId.toString() === recipientUser._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: "El usuario ya es miembro" });
    }

    const existingInvite = await Notification.findOne({
      type: "group_invite",
      status: "pending",
      recipient: recipientUser._id,
      groupId: group._id
    });

    if (existingInvite) {
      return res.status(400).json({ message: "Invitación ya enviada" });
    }

    await Notification.create({
      type: "group_invite",
      sender: req.user.id,
      recipient: recipientUser._id,
      groupId: group._id,
      message: `Te invitaron al grupo ${group.name}.`
    });

    res.json({ message: "Invitación enviada" });
  } catch (error) {
    next(error);
  }
};

export const getGroupInvites = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      members: req.user.id
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const invites = await Notification.find({
      groupId: group._id,
      type: "group_invite",
      status: "pending"
    })
      .sort({ createdAt: -1 })
      .populate("sender", "name email")
      .populate("recipient", "name email");

    const payload = invites.map((invite) => ({
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

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
