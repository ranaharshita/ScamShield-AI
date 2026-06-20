/**
 * Client for calling the FastAPI AI service (scamshield-ai).
 * Centralizes the base URL, timeout, and error normalization so
 * controllers don't need to know HTTP details.
 */

import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15000;

const aiClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

/**
 * Custom error so controllers can distinguish "AI service reachable but
 * returned an error" from "AI service unreachable entirely".
 */
export class AiServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AiServiceError";
    this.status = status;
  }
}

/**
 * Sends text to the AI service for scam analysis.
 * @param {string} text
 * @returns {Promise<object>} the analysis result
 */
export async function callAnalyzeText(text) {
  try {
    const { data } = await aiClient.post("/analyze-text", { text });
    return data;
  } catch (err) {
    throw normalizeAiError(err);
  }
}

/**
 * Sends a URL to the AI service for scam/phishing analysis.
 * @param {string} url
 * @returns {Promise<object>} the analysis result
 */
export async function callAnalyzeUrl(url) {
  try {
    const { data } = await aiClient.post("/analyze-url", { url });
    return data;
  } catch (err) {
    throw normalizeAiError(err);
  }
}

function normalizeAiError(err) {
  if (err.response) {
    // AI service responded with an error status (4xx/5xx)
    const detail = err.response.data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join("; ")
          : "AI service returned an error.";
    return new AiServiceError(message, err.response.status);
  }

  if (err.code === "ECONNABORTED") {
    return new AiServiceError("AI service timed out. Please try again.", 504);
  }

  // AI service unreachable (connection refused, DNS failure, etc.)
  return new AiServiceError(
    "Could not reach the AI analysis service. Please try again shortly.",
    503
  );
}
