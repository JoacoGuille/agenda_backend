import "./config/env.js";

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

connectDB();

const isProd = process.env.NODE_ENV === "production";
if (isProd) {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true
    })
  );
} else {
  app.use(cors());
}
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API corriendo" });
});

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/notifications", notificationRoutes);
app.use("/api/friends", friendRoutes);
app.use("/friends", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/groups", groupRoutes);
app.use("/api/search", searchRoutes);
app.use("/search", searchRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method
  });
});

app.use(errorMiddleware);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server  ${PORT}`);
});
