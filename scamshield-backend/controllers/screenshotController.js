/**
 * Controller for screenshot scam analysis.
 * Flow: validate upload -> OCR extract text -> analyze text via AI service
 * -> return both the extracted text and the analysis result.
 */

import path from "path";
import { extractTextFromImage, OcrError } from "../services/ocrService.js";
import { callAnalyzeText, AiServiceError } from "../services/aiServiceClient.js";

const MIME_TO_EXT = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/webp": ".webp",
};

/**
 * POST /api/analyze-screenshot
 * multipart/form-data, field name: "image"
 */
export async function analyzeScreenshot(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No image file was uploaded. Use field name 'image'." });
  }

  const extension = MIME_TO_EXT[req.file.mimetype] || path.extname(req.file.originalname) || ".png";

  let extractedText;
  try {
    extractedText = await extractTextFromImage(req.file.buffer, extension);
  } catch (err) {
    if (err instanceof OcrError) {
      return res.status(502).json({ error: err.message });
    }
    console.error("Unexpected OCR error:", err);
    return res.status(500).json({ error: "Failed to process the image." });
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return res.status(200).json({
      extractedText: "",
      analysis: {
        isScam: false,
        score: 0,
        category: "Other",
        risk: "Low",
        reasons: ["No readable text was found in this image."],
        source: "ocr_no_text",
      },
    });
  }

  try {
    const analysis = await callAnalyzeText(extractedText);
    return res.status(200).json({ extractedText, analysis });
  } catch (err) {
    if (err instanceof AiServiceError) {
      // We DID successfully extract text — still return it even if analysis failed,
      // so the user at least sees what was read from their screenshot.
      return res.status(err.status || 502).json({
        extractedText,
        error: err.message,
      });
    }
    console.error("Unexpected error analyzing extracted text:", err);
    return res.status(500).json({ extractedText, error: "Analysis failed unexpectedly." });
  }
}
