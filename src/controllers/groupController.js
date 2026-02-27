import crypto from "crypto";
import Group from "../models/Group.js";

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
