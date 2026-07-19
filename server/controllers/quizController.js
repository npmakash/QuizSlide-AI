import { generateQuizFromText } from '../services/geminiService.js';
import { validateAndNormalizeQuestions } from '../utils/validator.js';
import { createPresentationFromTemplate } from '../services/googleService.js';

/**
 * Endpoint to parse raw text into structured JSON questions using Gemini AI.
 * POST /api/generate-json
 */
export const generateJson = async (req, res, next) => {
  const { rawText } = req.body;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Raw quiz text content is required.' });
  }

  try {
    console.log('Sending text to Gemini for structured parsing...');
    const parsedQuestions = await generateQuizFromText(rawText);
    
    console.log('Validating and normalizing parsed JSON questions...');
    const validated = validateAndNormalizeQuestions(parsedQuestions);

    // Save questions in the session for subsequent download/generation steps
    req.session.questions = validated;

    res.status(200).json({
      message: 'Questions parsed and validated successfully',
      count: validated.length,
      questions: validated
    });
  } catch (error) {
    console.error('Error generating JSON:', error);
    res.status(500).json({
      error: 'Failed to process quiz text.',
      details: error.message
    });
  }
};

/**
 * Endpoint to take structured questions and populate them into a template.
 * POST /api/replace-placeholders
 */
export const replacePlaceholders = async (req, res, next) => {
  const { presentationId, questions } = req.body;
  const tokens = req.session.tokens;

  if (!presentationId) {
    return res.status(400).json({ error: 'Google Slides presentation ID or URL is required.' });
  }

  // Use provided questions or fallback to the session
  const targetQuestions = questions || req.session.questions;

  if (!targetQuestions || !Array.isArray(targetQuestions) || targetQuestions.length === 0) {
    return res.status(400).json({ 
      error: 'No questions provided.', 
      details: 'Please parse some text first or provide a list of questions.' 
    });
  }

  try {
    // Validate again to make sure client-modified questions conform to standards
    const validated = validateAndNormalizeQuestions(targetQuestions);

    console.log(`Starting presentation generation for ${validated.length} questions...`);
    const result = await createPresentationFromTemplate(presentationId, validated, tokens);

    // Cache presentation details in the session for downloads
    req.session.lastPresentationId = result.presentationId;
    req.session.questions = validated;

    res.status(200).json({
      message: 'Presentation generated successfully',
      presentationId: result.presentationId,
      url: result.url
    });
  } catch (error) {
    console.error('Error replacing placeholders:', error);
    res.status(500).json({
      error: 'Failed to generate presentation.',
      details: error.message
    });
  }
};

/**
 * Combined endpoint: Parses raw text and generates slides in one request.
 * POST /api/generate-presentation
 */
export const generatePresentation = async (req, res, next) => {
  const { rawText, presentationId } = req.body;
  const tokens = req.session.tokens;

  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'Raw quiz text content is required.' });
  }
  if (!presentationId) {
    return res.status(400).json({ error: 'Google Slides presentation ID or URL is required.' });
  }

  try {
    console.log('Step 1: Parsing text with Gemini...');
    const parsedQuestions = await generateQuizFromText(rawText);
    const validated = validateAndNormalizeQuestions(parsedQuestions);
    req.session.questions = validated;

    console.log('Step 2: Copying template and replacing placeholders...');
    const result = await createPresentationFromTemplate(presentationId, validated, tokens);
    req.session.lastPresentationId = result.presentationId;

    res.status(200).json({
      message: 'Presentation fully generated from raw text',
      count: validated.length,
      presentationId: result.presentationId,
      url: result.url,
      questions: validated
    });
  } catch (error) {
    console.error('Error in combined presentation generation:', error);
    res.status(500).json({
      error: 'Failed to generate complete presentation.',
      details: error.message
    });
  }
};
