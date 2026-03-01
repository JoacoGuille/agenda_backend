import {
  createEventForUser,
  deleteEventForUserById,
  getEventByIdForUser,
  getEventsForUser,
  updateEventForUserById
} from "../services/eventService.js";

export const getEvents = async (req, res, next) => {
  try {
    const events = await getEventsForUser(req.user.id, req.query);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await getEventByIdForUser(req.user.id, req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await createEventForUser(req.user.id, req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await updateEventForUserById(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const result = await deleteEventForUserById(req.user.id, req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
