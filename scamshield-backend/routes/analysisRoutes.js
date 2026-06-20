import { Router } from "express";
import { analyzeText, analyzeUrl } from "../controllers/analysisController.js";
import { analyzeScreenshot } from "../controllers/screenshotController.js";
import { screenshotUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

router.post("/analyze-text", analyzeText);
router.post("/analyze-url", analyzeUrl);
router.post("/analyze-screenshot", screenshotUpload, analyzeScreenshot);

export default router;
