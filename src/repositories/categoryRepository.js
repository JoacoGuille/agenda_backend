import Category from "../models/Category.js";

export const findCategoriesByUser = (userId) =>
  Category.find({ user: userId }).sort({ createdAt: -1 });

export const findCategoryByIdForUser = (categoryId, userId) =>
  Category.findOne({ _id: categoryId, user: userId });

export const createCategory = (data) => Category.create(data);

export const updateCategoryForUser = (categoryId, userId, update) =>
  Category.findOneAndUpdate({ _id: categoryId, user: userId }, update, {
    new: true,
    runValidators: true
  });

export const deleteCategoryForUser = (categoryId, userId) =>
  Category.findOneAndDelete({ _id: categoryId, user: userId });

export const countCategoriesByUser = (userId) =>
  Category.countDocuments({ user: userId });

export const searchCategoriesForUser = (userId, regex) =>
  Category.find({
    user: userId,
    $or: [{ name: regex }, { description: regex }]
  })
    .sort({ name: 1 })
    .limit(20);
