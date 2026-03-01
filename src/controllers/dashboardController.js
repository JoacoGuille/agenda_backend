import { getDashboardSummary } from "../services/dashboardService.js";

export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user.id);
    res.json(summary);
  } catch (error) {
    next(error);
  }
};
