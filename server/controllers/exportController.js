import { exportPresentationFile } from '../services/googleService.js';

/**
 * Downloads the current session questions as a JSON file.
 * GET /api/download-json
 */
export const downloadJson = (req, res) => {
  const questions = req.session.questions;

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(404).json({
      error: 'No parsed questions found in your session.',
      details: 'Please enter and parse questions first before attempting to download.'
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="quiz_questions.json"');
  
  return res.send(JSON.stringify(questions, null, 2));
};

/**
 * Exports and downloads the generated presentation as a PDF.
 * GET /api/download-pdf
 */
export const downloadPdf = async (req, res, next) => {
  const presentationId = req.query.presentationId || req.session.lastPresentationId;
  const tokens = req.session.tokens;

  if (!presentationId) {
    return res.status(400).json({
      error: 'Presentation ID is missing.',
      details: 'Please generate a presentation first or specify a valid presentationId query parameter.'
    });
  }

  try {
    console.log(`Exporting presentation ${presentationId} as PDF...`);
    const pdfStream = await exportPresentationFile(
      presentationId,
      'application/pdf',
      tokens
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quiz_presentation_${presentationId.substring(0, 6)}.pdf"`);

    pdfStream.pipe(res);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({
      error: 'Failed to download PDF export from Google Drive.',
      details: error.message
    });
  }
};

/**
 * Exports and downloads the generated presentation as a PowerPoint PPTX file.
 * GET /api/download-ppt
 */
export const downloadPpt = async (req, res, next) => {
  const presentationId = req.query.presentationId || req.session.lastPresentationId;
  const tokens = req.session.tokens;

  if (!presentationId) {
    return res.status(400).json({
      error: 'Presentation ID is missing.',
      details: 'Please generate a presentation first or specify a valid presentationId query parameter.'
    });
  }

  try {
    console.log(`Exporting presentation ${presentationId} as PPTX...`);
    const pptxMime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    const pptxStream = await exportPresentationFile(
      presentationId,
      pptxMime,
      tokens
    );

    res.setHeader('Content-Type', pptxMime);
    res.setHeader('Content-Disposition', `attachment; filename="quiz_presentation_${presentationId.substring(0, 6)}.pptx"`);

    pptxStream.pipe(res);
  } catch (error) {
    console.error('Error exporting PPTX:', error);
    res.status(500).json({
      error: 'Failed to download PowerPoint export from Google Drive.',
      details: error.message
    });
  }
};
