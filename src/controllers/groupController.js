import crypto from "crypto";
import mongoose from "mongoose";
import Group from "../models/Group.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

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

const withId = (doc) => {
  if (!doc) return doc;
  const payload = doc.toObject ? doc.toObject() : { ...doc };
  if (!payload.id && payload._id) {
    payload.id = payload._id.toString();
  }
  return payload;
};

const toUserPayload = (user) => {
  if (!user) return null;
  if (typeof user === "string") return user;
  const hasProfile = user.name || user.email || user._id || user.id;
  if (!hasProfile) {
    return typeof user.toString === "function" ? user.toString() : user;
  }
  return {
    id: user._id?.toString?.() ?? user.id,
    _id: user._id ?? user.id,
    name: user.name,
    email: user.email
  };
};

const withMembers = (group) => {
  const payload = withId(group);
  if (payload && Array.isArray(payload.members)) {
    payload.members = payload.members.map((member) =>
      member && typeof member === "object" ? toUserPayload(member) : member
    );
  }
  if (payload?.owner && typeof payload.owner === "object") {
    payload.owner = toUserPayload(payload.owner);
  }
  return payload;
};

export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      $or: [{ owner: req.user.id }, { members: req.user.id }]
    })
      .sort({ createdAt: -1 })
      .populate("members", "name email")
      .populate("owner", "name email");
    res.json(groups.map(withMembers));
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const groupId = (req.params.id ?? "").toString().trim();
    let group = null;
    if (req.user?.id) {
      group = await Group.findOne({
        _id: groupId,
        $or: [{ owner: req.user.id }, { members: req.user.id }]
      })
        .populate("members", "name email")
        .populate("owner", "name email");
    }
    if (!group) {
      const token = (req.query.token ?? req.query.inviteToken ?? "")
        .toString()
        .trim();
      if (!token) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      const invitedGroup = await Group.findOne({
        _id: groupId,
        inviteToken: token
      })
        .populate("members", "name email")
        .populate("owner", "name email");

      if (!invitedGroup) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }

      return res.json(withMembers(invitedGroup));
    }
    res.json(withMembers(group));
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

    res.status(201).json(withId(group));
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const groupId = resolveGroupId(req.params.id);
    if (!groupId) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (group.owner?.toString?.() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    const { name, description } = req.body;
    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;

    await group.save();
    res.json(withId(group));
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const groupId = resolveGroupId(req.params.id);
    if (!groupId) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (group.owner?.toString?.() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    await Group.deleteOne({ _id: groupId });

    res.json({ message: "Grupo eliminado" });
  } catch (error) {
    next(error);
  }
};

export const createInviteLink = async (req, res, next) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      $or: [{ owner: req.user.id }, { members: req.user.id }]
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
      $or: [{ owner: req.user.id }, { members: req.user.id }]
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
      $or: [{ owner: req.user.id }, { members: req.user.id }]
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

export const joinGroupByToken = async (req, res, next) => {
  try {
    const token = (req.body?.token ?? req.query.token ?? "").toString().trim();
    const groupId = (
      req.body?.groupId ??
      req.query.groupId ??
      req.body?.id ??
      ""
    )
      .toString()
      .trim();

    if (!token || !groupId) {
      return res
        .status(400)
        .json({ message: "Token y grupo son obligatorios" });
    }

    const group = await Group.findOne({ _id: groupId, inviteToken: token })
      .populate("members", "name email")
      .populate("owner", "name email");

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (!req.user?.id) {
      return res.json({ ...withMembers(group), joinRequired: true });
    }

    await Group.updateOne(
      { _id: group._id },
      { $addToSet: { members: req.user.id } }
    );

    const updated = await Group.findById(group._id)
      .populate("members", "name email")
      .populate("owner", "name email");
    res.json(withMembers(updated));
  } catch (error) {
    next(error);
  }
};
