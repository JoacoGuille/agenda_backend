import {
  createGroupForUser,
  createInviteLinkForGroup,
  deleteGroupForUser,
  getGroupByIdForUser,
  getGroupInvitesForUser,
  getGroupsForUser,
  inviteUserToGroup,
  joinGroupByToken as joinGroupByTokenService,
  updateGroupForUser
} from "../services/groupService.js";

export const getGroups = async (req, res, next) => {
  try {
    const groups = await getGroupsForUser(req.user.id);
    res.json(groups);
  } catch (error) {
    next(error);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await getGroupByIdForUser(
      req.user?.id,
      req.params.id,
      req.query.token ?? req.query.inviteToken
    );
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const createGroup = async (req, res, next) => {
  try {
    const group = await createGroupForUser(req.user.id, req.body);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
};

export const updateGroup = async (req, res, next) => {
  try {
    const group = await updateGroupForUser(req.user.id, req.params.id, req.body);
    res.json(group);
  } catch (error) {
    next(error);
  }
};

export const deleteGroup = async (req, res, next) => {
  try {
    const result = await deleteGroupForUser(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const createInviteLink = async (req, res, next) => {
  try {
    const result = await createInviteLinkForGroup(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const inviteToGroup = async (req, res, next) => {
  try {
    const result = await inviteUserToGroup(req.user.id, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getGroupInvites = async (req, res, next) => {
  try {
    const invites = await getGroupInvitesForUser(req.user.id, req.params.id);
    res.json(invites);
  } catch (error) {
    next(error);
  }
};

export const joinGroupByToken = async (req, res, next) => {
  try {
    const token = req.body?.token ?? req.query.token;
    const groupId = req.body?.groupId ?? req.query.groupId ?? req.body?.id;
    const result = await joinGroupByTokenService(req.user?.id, token, groupId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
