import express from 'express';
import {
  generateJson,
  replacePlaceholders,
  generatePresentation
} from '../controllers/quizController.js';
import {
  downloadJson,
  downloadPdf,
  downloadPpt
} from '../controllers/exportController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Parse quiz content into structured JSON using AI (Does not require Google Auth)
router.post('/generate-json', generateJson);

// Re-download current parsed questions as JSON directly from session (Does not require Google Auth)
router.get('/download-json', downloadJson);

// Duplicate slides and replace placeholders (Requires Google Auth)
router.post('/replace-placeholders', requireAuth, replacePlaceholders);

// Combined single-step endpoint: parse and generate (Requires Google Auth)
router.post('/generate-presentation', requireAuth, generatePresentation);

// Export generated presentation as PDF (Requires Google Auth)
router.get('/download-pdf', requireAuth, downloadPdf);

// Export generated presentation as PPTX (Requires Google Auth)
router.get('/download-ppt', requireAuth, downloadPpt);

export default router;
