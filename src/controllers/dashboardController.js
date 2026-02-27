import mongoose from "mongoose";
import Event from "../models/Event.js";
import Category from "../models/Category.js";
import Notification from "../models/Notification.js";

const formatDate = (date) => date.toISOString().split("T")[0];

const getWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const upcomingLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { start, end } = getWeekRange();

    const [activeEvents, categoriesCount, alertsCount, remindersCount] =
      await Promise.all([
        Event.countDocuments({
          createdBy: userId,
          status: { $ne: "cancelled" },
          endAt: { $gte: now }
        }),
        Category.countDocuments({ user: userId }),
        Notification.countDocuments({
          recipient: userId,
          status: "pending"
        }),
        Event.countDocuments({
          createdBy: userId,
          startAt: { $gte: now, $lte: upcomingLimit }
        })
      ]);

    const upcoming = await Event.find({
      createdBy: userId,
      startAt: { $gte: now }
    })
      .sort({ startAt: 1 })
      .limit(5)
      .select("title startAt categoryId");

    const topCategories = await Event.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(userId),
          categoryId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$categoryId",
          eventsCount: { $sum: 1 }
        }
      },
      { $sort: { eventsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $project: {
          id: "$_id",
          name: "$category.name",
          eventsCount: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      activeEvents,
      categoriesCount,
      remindersCount,
      alertsCount,
      weekRange: `${formatDate(start)}/${formatDate(end)}`,
      upcoming,
      topCategories
    });
  } catch (error) {
    next(error);
  }
};
