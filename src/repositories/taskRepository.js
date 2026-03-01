import Task from "../models/Task.js";

export const findTasksByUser = (userId) =>
  Task.find({ user: userId }).sort({ createdAt: -1 });

export const createTask = (data) => Task.create(data);
