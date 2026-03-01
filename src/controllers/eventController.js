import Event from "../models/Event.js";

const normalizeDateString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }

  return null;
};

const normalizeTimeString = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return `${trimmed}:00`;
  }

  return null;
};

const parseDateTimeString = (value) => {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const match = trimmed.match(
    /^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (match) {
    const [, day, month, year, hour = "00", minute = "00", second = "00"] =
      match;
    const iso = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const buildDateTimeFromParts = (dateValue, timeValue) => {
  const datePart = normalizeDateString(dateValue);
  const timePart = normalizeTimeString(timeValue);
  if (!datePart || !timePart) return null;
  const composed = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(composed.getTime()) ? null : composed;
};

const resolveStartAt = (payload) => {
  const explicit =
    payload.startAt ?? payload.start ?? payload.startDate ?? payload.fecha;
  const parsedExplicit = parseDateTimeString(explicit);
  if (parsedExplicit) return parsedExplicit;

  const datePart = payload.date ?? payload.startDate ?? payload.fecha;
  const timePart = payload.time ?? payload.startTime ?? payload.hora;
  return buildDateTimeFromParts(datePart, timePart);
};

const resolveEndAt = (payload, startAt) => {
  const explicit = payload.endAt ?? payload.end ?? payload.endDate;
  const parsedExplicit = parseDateTimeString(explicit);
  if (parsedExplicit) return parsedExplicit;

  const datePart = payload.endDate ?? payload.date ?? payload.fecha;
  const timePart = payload.endTime ?? payload.horaFin;
  const composed = buildDateTimeFromParts(datePart, timePart);
  if (composed) return composed;

  const durationValue = payload.durationMinutes ?? payload.duration;
  if (durationValue !== undefined && startAt) {
    const durationNumber =
      typeof durationValue === "string" ? Number(durationValue) : durationValue;
    if (!Number.isNaN(durationNumber)) {
      return new Date(startAt.getTime() + durationNumber * 60000);
    }
  }

  return null;
};

const normalizeStatus = (value) => {
  if (!value || typeof value !== "string") return value;
  const normalized = value.trim().toLowerCase();

  const map = {
    planned: "planned",
    confirmado: "planned",
    confirmada: "planned",
    pendiente: "planned",
    cancelado: "cancelled",
    cancelada: "cancelled",
    cancelled: "cancelled",
    finalizado: "done",
    finalizada: "done",
    hecho: "done",
    completado: "done",
    done: "done"
  };

  return map[normalized] ?? value;
};

const withId = (doc) => {
  if (!doc) return doc;
  const payload = doc.toObject ? doc.toObject() : { ...doc };
  if (!payload.id && payload._id) {
    payload.id = payload._id.toString();
  }
  return payload;
};

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
    res.json(events.map(withId));
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
    res.json(withId(event));
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const title = req.body.title ?? req.body.titulo ?? req.body.name;
    const description = req.body.description ?? req.body.descripcion ?? "";
    const categoryId = req.body.categoryId ?? req.body.category ?? null;
    const location = req.body.location ?? req.body.lugar ?? "";
    const status = normalizeStatus(req.body.status);

    const startAt = resolveStartAt(req.body);
    const endAt = resolveEndAt(req.body, startAt) ?? startAt;

    if (!title || !startAt || !endAt) {
      return res.status(400).json({
        message: "Titulo, inicio y fin son obligatorios"
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

    res.status(201).json(withId(event));
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    const status = normalizeStatus(req.body.status);
    if (status !== undefined) {
      updates.status = status;
    }

    const startAt = resolveStartAt(req.body);
    if (startAt) {
      updates.startAt = startAt;
    }

    const endAt = resolveEndAt(req.body, startAt);
    if (endAt) {
      updates.endAt = endAt;
    }

    if (updates.category !== undefined && updates.categoryId === undefined) {
      updates.categoryId = updates.category;
    }

    delete updates.start;
    delete updates.end;
    delete updates.startDate;
    delete updates.endDate;
    delete updates.date;
    delete updates.time;
    delete updates.startTime;
    delete updates.endTime;
    delete updates.durationMinutes;
    delete updates.duration;
    delete updates.fecha;
    delete updates.hora;
    delete updates.horaFin;
    delete updates.category;

    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.json(withId(event));
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
