import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";

const fallbackValues = {
  PORT: "4000"
};

if (!isProd) {
  const port = process.env.PORT || fallbackValues.PORT;
  const fallbackFrontendUrl =
    process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:5173";
  const fallbackApiUrl = process.env.API_URL || `http://localhost:${port}`;

  process.env.PORT = port;
  process.env.FRONTEND_URL = process.env.FRONTEND_URL || fallbackFrontendUrl;
  process.env.APP_URL = process.env.APP_URL || fallbackFrontendUrl;
  process.env.API_URL = process.env.API_URL || fallbackApiUrl;
}

const requiredVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "RESEND_API_KEY"
];

if (isProd) {
  requiredVars.push("PORT", "FRONTEND_URL", "APP_URL", "API_URL");
}

const missingVars = requiredVars.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === "";
});

if (missingVars.length > 0) {
  console.error(`[ENV] Error de variables: ${missingVars.join(", ")}`);
  process.exit(1);
}
