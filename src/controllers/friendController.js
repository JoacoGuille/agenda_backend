import {
  acceptFriendInviteForUser,
  getFriendByIdForUser,
  getFriendsForUser,
  inviteFriendForUser,
  rejectFriendInviteForUser
} from "../services/friendService.js";

export const getFriends = async (req, res, next) => {
  try {
    const friends = await getFriendsForUser(req.user.id);
    res.json(friends);
  } catch (error) {
    next(error);
  }
};

export const getFriendById = async (req, res, next) => {
  try {
    const friend = await getFriendByIdForUser(req.user.id, req.params.id);
    res.json(friend);
  } catch (error) {
    next(error);
  }
};

export const inviteFriend = async (req, res, next) => {
  try {
    const result = await inviteFriendForUser(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const acceptFriend = async (req, res, next) => {
  try {
    const result = await acceptFriendInviteForUser(
      req.user.id,
      req.body.requestId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectFriend = async (req, res, next) => {
  try {
    const result = await rejectFriendInviteForUser(
      req.user.id,
      req.body.requestId
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};
