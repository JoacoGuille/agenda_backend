import {
  createEvent as createEventRecord,
  deleteEventForUser,
  findEventByIdForUser,
  findEventsByFilter,
  updateEventForUser
} from "../repositories/eventRepository.js";
import { httpError } from "../utils/httpError.js";
import { withId } from "../utils/mappers.js";

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

export const getEventsForUser = async (userId, query) => {
  const { from, to, categoryId, search } = query;
  const filter = { createdBy: userId };

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

  const events = await findEventsByFilter(filter);
  return events.map(withId);
};

export const getEventByIdForUser = async (userId, eventId) => {
  const event = await findEventByIdForUser(eventId, userId);
  if (!event) {
    throw httpError(404, "Evento no encontrado");
  }
  return withId(event);
};

export const createEventForUser = async (userId, payload) => {
  const title = payload.title ?? payload.titulo ?? payload.name;
  const description = payload.description ?? payload.descripcion ?? "";
  const categoryId = payload.categoryId ?? payload.category ?? null;
  const location = payload.location ?? payload.lugar ?? "";
  const status = normalizeStatus(payload.status);

  const startAt = resolveStartAt(payload);
  const endAt = resolveEndAt(payload, startAt) ?? startAt;

  if (!title || !startAt || !endAt) {
    throw httpError(400, "Titulo, inicio y fin son obligatorios");
  }

  const event = await createEventRecord({
    title,
    description,
    startAt,
    endAt,
    categoryId,
    location,
    status,
    createdBy: userId
  });

  return withId(event);
};

export const updateEventForUserById = async (userId, eventId, payload) => {
  const updates = { ...payload };

  const status = normalizeStatus(payload.status);
  if (status !== undefined) {
    updates.status = status;
  }

  const startAt = resolveStartAt(payload);
  if (startAt) {
    updates.startAt = startAt;
  }

  const endAt = resolveEndAt(payload, startAt);
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

  const event = await updateEventForUser(eventId, userId, updates);

  if (!event) {
    throw httpError(404, "Evento no encontrado");
  }

  return withId(event);
};

export const deleteEventForUserById = async (userId, eventId) => {
  const event = await deleteEventForUser(eventId, userId);
  if (!event) {
    throw httpError(404, "Evento no encontrado");
  }
  return { message: "Evento eliminado" };
};
