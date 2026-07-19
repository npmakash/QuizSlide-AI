/**
 * Normalizes and validates a list of quiz questions
 * @param {Array} questions - Array of question objects from the AI
 * @returns {Array} Cleaned and validated question list
 */
export const validateAndNormalizeQuestions = (questions) => {
  if (!Array.isArray(questions)) {
    throw new Error('Invalid input format: Expected an array of questions.');
  }

  const cleanedQuestions = [];
  const seenQuestions = new Set();

  for (const q of questions) {
    // 1. Check if it's a valid object
    if (!q || typeof q !== 'object') continue;

    // 2. Extract and trim fields
    const questionText = q.question ? String(q.question).trim() : '';
    const optionA = q.optionA ? String(q.optionA).trim() : (q.option_a ? String(q.option_a).trim() : '');
    const optionB = q.optionB ? String(q.optionB).trim() : (q.option_b ? String(q.option_b).trim() : '');
    const optionC = q.optionC ? String(q.optionC).trim() : (q.option_c ? String(q.option_c).trim() : '');
    const optionD = q.optionD ? String(q.optionD).trim() : (q.option_d ? String(q.option_d).trim() : '');
    
    // Normalize correct answer
    let correctAnswer = q.correctAnswer ? String(q.correctAnswer).trim() : (q.correct_answer ? String(q.correct_answer).trim() : (q.answer ? String(q.answer).trim() : ''));
    
    // Clean option prefix if any (e.g., "A. Delhi" -> "Delhi" or "Answer: A" -> "A")
    correctAnswer = correctAnswer.replace(/^(Answer|Ans|Correct):\s*/i, '').trim().toUpperCase();
    if (correctAnswer.length > 1) {
      // If it's something like "Option A" or "Delhi", try to match it against options
      const match = correctAnswer.match(/^[A-D]$/i);
      if (match) {
        correctAnswer = match[0];
      } else {
        // Fallback: try to see if it equals the content of any option
        if (correctAnswer === optionA.toUpperCase()) correctAnswer = 'A';
        else if (correctAnswer === optionB.toUpperCase()) correctAnswer = 'B';
        else if (correctAnswer === optionC.toUpperCase()) correctAnswer = 'C';
        else if (correctAnswer === optionD.toUpperCase()) correctAnswer = 'D';
        else {
          // Default to A if we can't parse it
          correctAnswer = 'A';
        }
      }
    }

    // Ensure correct answer is exactly A, B, C, or D
    if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      correctAnswer = 'A';
    }

    // 3. Validation: Skip if question or any of the 4 options are missing
    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
      continue;
    }

    // 4. Deduplication: Skip if we have already seen this question text (case-insensitive)
    const normalizedKey = questionText.toLowerCase();
    if (seenQuestions.has(normalizedKey)) {
      continue;
    }
    seenQuestions.add(normalizedKey);

    // 5. Add clean object
    cleanedQuestions.push({
      question: questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer
    });

    // 6. Hard limit to 60 questions
    if (cleanedQuestions.length >= 60) {
      break;
    }
  }

  if (cleanedQuestions.length === 0) {
    throw new Error('No valid multiple-choice questions found in the parsed data.');
  }

  return cleanedQuestions;
};
