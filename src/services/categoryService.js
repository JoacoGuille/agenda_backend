import {
  createCategory,
  deleteCategoryForUser,
  findCategoriesByUser,
  findCategoryByIdForUser,
  updateCategoryForUser
} from "../repositories/categoryRepository.js";
import { httpError } from "../utils/httpError.js";
import { withId } from "../utils/mappers.js";

export const getAllCategories = async (userId) => {
  const categories = await findCategoriesByUser(userId);
  return categories.map(withId);
};

export const getCategoryById = async (userId, categoryId) => {
  const category = await findCategoryByIdForUser(categoryId, userId);
  if (!category) {
    throw httpError(404, "Categoría no encontrada");
  }
  return withId(category);
};

export const createCategoryForUser = async (userId, payload) => {
  const { name, description = "", color = "#5B7CFA" } = payload;
  if (!name) {
    throw httpError(400, "El nombre es obligatorio");
  }

  const category = await createCategory({
    name,
    description,
    color,
    user: userId
  });

  return withId(category);
};

export const updateCategoryForUserById = async (userId, categoryId, payload) => {
  const { name, description, color } = payload;
  const category = await updateCategoryForUser(categoryId, userId, {
    name,
    description,
    color
  });

  if (!category) {
    throw httpError(404, "Categoría no encontrada");
  }

  return withId(category);
};

export const deleteCategoryForUserById = async (userId, categoryId) => {
  const category = await deleteCategoryForUser(categoryId, userId);
  if (!category) {
    throw httpError(404, "Categoría no encontrada");
  }
  return { message: "Categoría eliminada" };
};
