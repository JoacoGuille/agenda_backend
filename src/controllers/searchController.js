import Category from "../models/Category.js";
import Event from "../models/Event.js";

export const searchAll = async (req, res, next) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json({ events: [], categories: [] });
    }

    const regex = new RegExp(query, "i");

    const [events, categories] = await Promise.all([
      Event.find({
        createdBy: req.user.id,
        $or: [{ title: regex }, { description: regex }]
      })
        .sort({ startAt: 1 })
        .limit(20),
      Category.find({
        user: req.user.id,
        $or: [{ name: regex }, { description: regex }]
      })
        .sort({ name: 1 })
        .limit(20)
    ]);

    res.json({ events, categories });
  } catch (error) {
    next(error);
  }
};
