import {
  searchCategoriesForUser
} from "../repositories/categoryRepository.js";
import { searchEventsForUser } from "../repositories/eventRepository.js";
import { withId } from "../utils/mappers.js";

export const searchAllForUser = async (userId, query) => {
  const q = (query || "").trim();
  if (!q) {
    return { events: [], categories: [] };
  }

  const regex = new RegExp(q, "i");

  const [events, categories] = await Promise.all([
    searchEventsForUser(userId, regex),
    searchCategoriesForUser(userId, regex)
  ]);

  return {
    events: events.map(withId),
    categories: categories.map(withId)
  };
};
