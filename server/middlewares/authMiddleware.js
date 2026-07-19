/**
 * Middleware to check if the user is authenticated with Google OAuth
 */
export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({
      error: 'Google Account connection required.',
      details: 'Please sign in with Google to grant permission for Slides and Drive operations.'
    });
  }
  next();
};
