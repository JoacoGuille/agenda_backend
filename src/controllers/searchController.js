import { searchAllForUser } from "../services/searchService.js";

export const searchAll = async (req, res, next) => {
  try {
    const result = await searchAllForUser(req.user.id, req.query.q);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
