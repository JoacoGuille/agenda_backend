import Event from "../models/Event.js";

export const getEvents = async (req, res, next) => {
  try {
    const { from, to, categoryId, search } = req.query;
    const filter = { createdBy: req.user.id };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      if (fromDate && toDate) {
        filter.$and = [
          { startAt: { $lte: toDate } },
          { endAt: { $gte: fromDate } }
        ];
      } else if (fromDate) {
        filter.endAt = { $gte: fromDate };
      } else if (toDate) {
        filter.startAt = { $lte: toDate };
      }
    }

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const events = await Event.find(filter).sort({ startAt: 1 });
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, startAt, endAt, categoryId, location, status } =
      req.body;

    if (!title || !startAt || !endAt) {
      return res.status(400).json({
        message: "Título, inicio y fin son obligatorios"
      });
    }

    const event = await Event.create({
      title,
      description,
      startAt,
      endAt,
      categoryId,
      location,
      status,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    });
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    res.json({ message: "Evento eliminado" });
  } catch (error) {
    next(error);
  }
};
