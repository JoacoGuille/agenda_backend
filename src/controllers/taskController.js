import Task from "../models/Task.js";

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: "El título es obligatorio" });
    }
    const task = await Task.create({
      title,
      description,
      user: req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};
