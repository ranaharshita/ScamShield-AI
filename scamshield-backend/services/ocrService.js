/**
 * OCR service — extracts text from an image using the system Tesseract binary.
 *
 * SECURITY NOTE: this uses child_process.execFile, NOT exec/spawn-with-shell.
 * execFile passes arguments as an array directly to the binary without ever
 * invoking a shell, so there is no shell-injection surface regardless of
 * what the uploaded filename or path contains. (An earlier candidate
 * dependency, node-tesseract-ocr, had a known unpatched command-injection
 * vulnerability — this hand-rolled wrapper avoids that class of bug entirely.)
 *
 * Requires the `tesseract` binary to be installed on the host:
 *   - Local dev (Ubuntu/Debian): sudo apt-get install tesseract-ocr
 *   - Render: add tesseract-ocr via a build script / apt buildpack (see README)
 */

import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

export class OcrError extends Error {
  constructor(message) {
    super(message);
    this.name = "OcrError";
  }
}

/**
 * Runs Tesseract OCR on an image buffer and returns the extracted text.
 * @param {Buffer} imageBuffer - raw image bytes (from multer's in-memory storage)
 * @param {string} originalExtension - e.g. ".png", ".jpg" — used only to pick
 *   a temp filename; never passed to a shell.
 * @returns {Promise<string>} extracted text, trimmed
 */
export async function extractTextFromImage(imageBuffer, originalExtension = ".png") {
  const safeExt = [".png", ".jpg", ".jpeg", ".webp"].includes(originalExtension)
    ? originalExtension
    : ".png";

  const tempDir = os.tmpdir();
  const tempId = crypto.randomUUID();
  const inputPath = path.join(tempDir, `scamshield-ocr-${tempId}${safeExt}`);
  const outputBasePath = path.join(tempDir, `scamshield-ocr-${tempId}-out`);

  try {
    await fs.writeFile(inputPath, imageBuffer);

    // execFile takes the command and an ARRAY of arguments — no shell is
    // invoked, so there's no way for a crafted filename or path to break
    // out into shell metacharacters.
    await execFileAsync("tesseract", [inputPath, outputBasePath], {
      timeout: 20000, // 20s safety timeout in case of a malformed/huge image
    });

    const outputText = await fs.readFile(`${outputBasePath}.txt`, "utf-8");
    return outputText.trim();
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new OcrError(
        "Tesseract OCR is not installed on this server. Install the tesseract-ocr system package."
      );
    }
    if (err.killed || err.signal === "SIGTERM") {
      throw new OcrError("OCR processing timed out. Try a smaller or clearer image.");
    }
    throw new OcrError("Failed to extract text from the image.");
  } finally {
    // Always clean up temp files, even if OCR failed.
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(`${outputBasePath}.txt`).catch(() => {});
  }
}
