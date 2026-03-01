import { createTaskForUser, getAllTasks as getAllTasksService } from "../services/taskService.js";

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await getAllTasksService(req.user.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await createTaskForUser(req.user.id, req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};
