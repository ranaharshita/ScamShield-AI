/**
 * Global error-handling middleware. Catches anything that wasn't already
 * handled inside a controller's try/catch — last line of defense so the
 * server never crashes or leaks a raw stack trace to the client.
 *
 * Must be registered LAST, after all routes, per Express convention.
 */
import multer from "multer";

export function errorHandler(err, req, res, _next) {
  // Multer-specific errors (file too large, wrong field name, etc.)
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be smaller than 8MB."
        : "File upload failed.";
    return res.status(400).json({ error: message });
  }

  // Our custom fileFilter throws this plain Error for disallowed mime types.
  if (err.message === "UNSUPPORTED_FILE_TYPE") {
    return res.status(400).json({ error: "Only PNG, JPG, or WEBP images are supported." });
  }

  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return;
  }

  res.status(500).json({ error: "An unexpected server error occurred." });
}

/**
 * Catches requests to routes that don't exist.
 * Must be registered after all real routes, before errorHandler.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
}
