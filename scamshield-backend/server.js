/**
 * ScamShield AI — Express backend entrypoint.
 *
 * Sits between the Next.js frontend and the FastAPI AI service.
 * Handles request validation, CORS, and routing. Heavier analysis logic
 * (rule-based + LLM) lives in scamshield-ai, not here.
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import analysisRoutes from "./routes/analysisRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "scamshield-backend" });
});

app.use("/api", analysisRoutes);

// Must be registered after all real routes.
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`ScamShield backend running on http://localhost:${PORT}`);
});
