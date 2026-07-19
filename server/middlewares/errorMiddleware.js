/**
 * Global Express error handling middleware.
 * Ensures all uncaught route errors return clean, standardized JSON structures.
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler] Caught exception:', err);

  const statusCode = err.statusCode || err.status || 500;
  
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server.',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
