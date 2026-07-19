import { getGoogleDriveClient, getGoogleSlidesClient } from '../config/google.js';
import { extractPresentationId } from '../utils/slideParser.js';

/**
 * Creates a copy of the template presentation and populates it with quiz questions.
 * @param {string} urlOrId - The presentation template URL or ID.
 * @param {Array} questions - List of validated quiz questions.
 * @param {Object} tokens - User's Google OAuth credentials.
 * @returns {Promise<Object>} The generated presentation ID and URL.
 */
export const createPresentationFromTemplate = async (urlOrId, questions, tokens) => {
  const templateId = extractPresentationId(urlOrId);
  if (!templateId) {
    throw new Error('Invalid Presentation ID or URL. Please verify the link.');
  }

  const drive = getGoogleDriveClient(tokens);
  const slides = getGoogleSlidesClient(tokens);

  // 1. Copy the template presentation so the user's template remains untouched
  console.log(`Copying template presentation: ${templateId}`);
  let copyResponse;
  try {
    copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: `Quiz Presentation - ${new Date().toLocaleDateString()}`,
      },
    });
  } catch (error) {
    throw new Error(`Google API copy failed. Ensure the template is shared or viewable. Details: ${error.message}`);
  }

  const newPresentationId = copyResponse.data.id;
  console.log(`Created new presentation: ${newPresentationId}`);

  // 2. Fetch slides of the copied presentation to identify the question template slide
  const presentation = await slides.presentations.get({
    presentationId: newPresentationId,
  });

  const slideList = presentation.data.slides || [];
  let templateSlideId = null;

  // Search slides for the slide that contains the {{QUESTION}} placeholder
  for (const slide of slideList) {
    const pageId = slide.objectId;
    const elements = slide.pageElements || [];

    for (const element of elements) {
      // Check simple shapes
      if (element.shape && element.shape.text && element.shape.text.textElements) {
        const text = element.shape.text.textElements
          .map(te => te.textRun?.content || '')
          .join('');
        if (text.toLowerCase().includes('{{question}}')) {
          templateSlideId = pageId;
          break;
        }
      }

      // Check tables
      if (element.table && element.table.tableRows) {
        for (const row of element.table.tableRows) {
          const cells = row.tableCells || [];
          for (const cell of cells) {
            if (cell.text && cell.text.textElements) {
              const text = cell.text.textElements
                .map(te => te.textRun?.content || '')
                .join('');
              if (text.toLowerCase().includes('{{question}}')) {
                templateSlideId = pageId;
                break;
              }
            }
          }
          if (templateSlideId) break;
        }
      }
      if (templateSlideId) break;
    }
    if (templateSlideId) break;
  }

  if (!templateSlideId) {
    // If no slide has the placeholder, clean up the copied slide and throw an error
    try {
      await drive.files.delete({ fileId: newPresentationId });
    } catch (err) {
      console.error('Failed to delete incomplete presentation copy:', err);
    }
    throw new Error('Template presentation must contain at least one slide with the placeholder {{question}}.');
  }

  const numQuestions = questions.length;
  const slideIds = [templateSlideId];

  // 3. Duplicate the template slide N-1 times
  if (numQuestions > 1) {
    console.log(`Duplicating template slide ${numQuestions - 1} times`);
    const duplicateRequests = [];
    
    for (let i = 1; i < numQuestions; i++) {
      const newSlideId = `quiz_slide_q_${i}_${Date.now().toString(36)}`;
      slideIds.push(newSlideId);
      
      duplicateRequests.push({
        duplicateObject: {
          objectId: templateSlideId,
          objectIds: {
            [templateSlideId]: newSlideId
          }
        }
      });
    }

    try {
      await slides.presentations.batchUpdate({
        presentationId: newPresentationId,
        requestBody: {
          requests: duplicateRequests
        }
      });
    } catch (error) {
      throw new Error(`Failed to duplicate slide templates: ${error.message}`);
    }
  }

  // 4. Batch replace placeholders slide-by-slide
  console.log(`Replacing placeholders for ${numQuestions} questions`);
  const replaceRequests = [];

  for (let i = 0; i < numQuestions; i++) {
    const q = questions[i];
    const targetSlideId = slideIds[i];

    const placeholders = [
      { key: '{{number}}', val: (i + 1).toString() },
      { key: '{{NUMBER}}', val: (i + 1).toString() },
      
      { key: '{{question}}', val: q.question },
      { key: '{{QUESTION}}', val: q.question },
      
      { key: '{{optionA}}', val: q.optionA },
      { key: '{{OPTION_A}}', val: q.optionA },
      { key: '{{option_a}}', val: q.optionA },
      { key: '{{OPTION_a}}', val: q.optionA },
      
      { key: '{{optionB}}', val: q.optionB },
      { key: '{{OPTION_B}}', val: q.optionB },
      { key: '{{option_b}}', val: q.optionB },
      { key: '{{OPTION_b}}', val: q.optionB },
      
      { key: '{{optionC}}', val: q.optionC },
      { key: '{{OPTION_C}}', val: q.optionC },
      { key: '{{option_c}}', val: q.optionC },
      { key: '{{OPTION_c}}', val: q.optionC },
      
      { key: '{{optionD}}', val: q.optionD },
      { key: '{{OPTION_D}}', val: q.optionD },
      { key: '{{option_d}}', val: q.optionD },
      { key: '{{OPTION_d}}', val: q.optionD },
      
      { key: '{{answer}}', val: q.correctAnswer },
      { key: '{{ANSWER}}', val: q.correctAnswer }
    ];

    for (const item of placeholders) {
      replaceRequests.push({
        replaceAllText: {
          containsText: {
            text: item.key,
            matchCase: true
          },
          replaceText: item.val,
          pageObjectIds: [targetSlideId]
        }
      });
    }
  }

  try {
    await slides.presentations.batchUpdate({
      presentationId: newPresentationId,
      requestBody: {
        requests: replaceRequests
      }
    });
  } catch (error) {
    throw new Error(`Failed to insert question content into slides: ${error.message}`);
  }

  return {
    presentationId: newPresentationId,
    url: `https://docs.google.com/presentation/d/${newPresentationId}/edit`
  };
};

/**
 * Exports a presentation to PDF or PPTX format.
 * @param {string} presentationId - Google Slides ID
 * @param {string} mimeType - Export MIME type (e.g. application/pdf)
 * @param {Object} tokens - User's Google credentials
 * @returns {Promise<stream.Readable>} Stream containing file contents
 */
export const exportPresentationFile = async (presentationId, mimeType, tokens) => {
  const drive = getGoogleDriveClient(tokens);
  
  try {
    const response = await drive.files.export({
      fileId: presentationId,
      mimeType: mimeType
    }, {
      responseType: 'stream'
    });
    
    return response.data;
  } catch (error) {
    throw new Error(`Failed to export presentation from Google Drive: ${error.message}`);
  }
};
