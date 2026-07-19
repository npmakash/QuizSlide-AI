import rateLimit from 'express-rate-limit';

/**
 * Standard API rate limiter to prevent abuse and protect third-party API rate quotas (Gemini / Google)
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable legacy headers
  message: {
    error: 'Too many requests from this network.',
    details: 'To protect API rate limit quotas, requests are temporarily restricted. Please try again in 15 minutes.'
  }
});

/**
 * Strict limiter specifically for AI processing endpoints which carry higher processing costs
 */
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 20, // Limit each IP to 20 AI processing requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI generation limit reached.',
    details: 'You have sent too many requests to Gemini. Please wait 5 minutes before trying again.'
  }
});
