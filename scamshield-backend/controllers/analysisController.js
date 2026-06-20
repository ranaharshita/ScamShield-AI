/**
 * Controller for text and URL scam analysis endpoints.
 * Validates input, delegates to the AI service client, and shapes
 * the HTTP response. Screenshot analysis lives in its own controller
 * (added in Phase 4) since it has a different request shape (multipart).
 */

import { callAnalyzeText, callAnalyzeUrl, AiServiceError } from "../services/aiServiceClient.js";

/**
 * POST /api/analyze-text
 * Body: { text: string }
 */
export async function analyzeText(req, res) {
  const { text } = req.body;

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "Field 'text' is required and must be a non-empty string." });
  }

  if (text.length > 8000) {
    return res.status(400).json({ error: "Text must be 8000 characters or fewer." });
  }

  try {
    const result = await callAnalyzeText(text.trim());
    return res.status(200).json(result);
  } catch (err) {
    return handleAiError(err, res);
  }
}

/**
 * POST /api/analyze-url
 * Body: { url: string }
 */
export async function analyzeUrl(req, res) {
  const { url } = req.body;

  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return res.status(400).json({ error: "Field 'url' is required and must be a non-empty string." });
  }

  if (url.length > 2048) {
    return res.status(400).json({ error: "URL must be 2048 characters or fewer." });
  }

  try {
    const result = await callAnalyzeUrl(url.trim());
    return res.status(200).json(result);
  } catch (err) {
    return handleAiError(err, res);
  }
}

/**
 * Shared error handler for AI service failures — maps AiServiceError
 * to a clean JSON response with the right status code.
 */
function handleAiError(err, res) {
  if (err instanceof AiServiceError) {
    return res.status(err.status || 502).json({ error: err.message });
  }
  console.error("Unexpected error in analysisController:", err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}
