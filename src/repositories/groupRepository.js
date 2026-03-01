import Group from "../models/Group.js";

const applyGroupPopulate = (query, populateMembers) => {
  if (populateMembers) {
    query.populate("members", "name email").populate("owner", "name email");
  }
  return query;
};

export const findGroupsForUser = (userId, { populateMembers = false } = {}) => {
  const query = Group.find({
    $or: [{ owner: userId }, { members: userId }]
  }).sort({ createdAt: -1 });
  applyGroupPopulate(query, populateMembers);
  return query;
};

export const findGroupByIdForUser = (
  groupId,
  userId,
  { populateMembers = false } = {}
) => {
  const query = Group.findOne({
    _id: groupId,
    $or: [{ owner: userId }, { members: userId }]
  });
  applyGroupPopulate(query, populateMembers);
  return query;
};

export const findGroupById = (groupId, { populateMembers = false } = {}) => {
  const query = Group.findById(groupId);
  applyGroupPopulate(query, populateMembers);
  return query;
};

export const findGroupByInviteToken = (
  groupId,
  token,
  { populateMembers = false } = {}
) => {
  const query = Group.findOne({ _id: groupId, inviteToken: token });
  applyGroupPopulate(query, populateMembers);
  return query;
};

export const createGroup = (data) => Group.create(data);

export const saveGroup = (group) => group.save();

export const updateGroupById = (groupId, update) =>
  Group.findByIdAndUpdate(groupId, update, { new: true, runValidators: true });

export const deleteGroupById = (groupId) => Group.deleteOne({ _id: groupId });

export const addMemberToGroup = (groupId, userId) =>
  Group.updateOne({ _id: groupId }, { $addToSet: { members: userId } });
