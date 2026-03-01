import Event from "../models/Event.js";

export const findEventsByFilter = (filter) =>
  Event.find(filter).sort({ startAt: 1 });

export const findEventByIdForUser = (eventId, userId) =>
  Event.findOne({ _id: eventId, createdBy: userId });

export const createEvent = (data) => Event.create(data);

export const updateEventForUser = (eventId, userId, update, options = {}) =>
  Event.findOneAndUpdate(
    { _id: eventId, createdBy: userId },
    update,
    { new: true, runValidators: true, ...options }
  );

export const deleteEventForUser = (eventId, userId) =>
  Event.findOneAndDelete({ _id: eventId, createdBy: userId });

export const countEventsByFilter = (filter) => Event.countDocuments(filter);

export const findEvents = (filter, options = {}) => {
  const query = Event.find(filter);
  if (options.sort) query.sort(options.sort);
  if (options.limit) query.limit(options.limit);
  if (options.select) query.select(options.select);
  return query;
};

export const aggregateEvents = (pipeline) => Event.aggregate(pipeline);

export const searchEventsForUser = (userId, regex) =>
  Event.find({
    createdBy: userId,
    $or: [{ title: regex }, { description: regex }]
  })
    .sort({ startAt: 1 })
    .limit(20);
