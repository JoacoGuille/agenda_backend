import { createTask, findTasksByUser } from "../repositories/taskRepository.js";
import { httpError } from "../utils/httpError.js";
import { withId } from "../utils/mappers.js";

export const getAllTasks = async (userId) => {
  const tasks = await findTasksByUser(userId);
  return tasks.map(withId);
};

export const createTaskForUser = async (userId, payload) => {
  const { title, description } = payload;
  if (!title) {
    throw httpError(400, "El título es obligatorio");
  }
  const task = await createTask({
    title,
    description,
    user: userId
  });
  return withId(task);
};
