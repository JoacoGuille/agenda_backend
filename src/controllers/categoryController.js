import {
  createCategoryForUser,
  deleteCategoryForUserById,
  getAllCategories as getAllCategoriesService,
  getCategoryById as getCategoryByIdService,
  updateCategoryForUserById
} from "../services/categoryService.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await getAllCategoriesService(req.user.id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await getCategoryByIdService(req.user.id, req.params.id);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await createCategoryForUser(req.user.id, req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await updateCategoryForUserById(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const result = await deleteCategoryForUserById(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
