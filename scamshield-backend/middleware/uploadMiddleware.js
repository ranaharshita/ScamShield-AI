/**
 * Multer configuration for screenshot uploads.
 * Uses memory storage (no disk write here) — the OCR service handles
 * its own temp file lifecycle internally. Keeps this middleware focused
 * purely on accepting and validating the upload.
 */

import multer from "multer";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB, matches frontend validator

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

const storage = multer.memoryStorage();

function fileFilter(req, file, callback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return callback(new Error("UNSUPPORTED_FILE_TYPE"));
  }
  callback(null, true);
}

export const screenshotUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 1 },
  fileFilter,
}).single("image");
