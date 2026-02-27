import Category from "../models/Category.js";

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({
      createdAt: -1
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description = "", color = "#5B7CFA" } = req.body;
    if (!name) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }

    const category = await Category.create({
      name,
      description,
      color,
      user: req.user.id
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, description, color },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }
    res.json({ message: "Categoría eliminada" });
  } catch (error) {
    next(error);
  }
};
