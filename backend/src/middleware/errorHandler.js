// Global Error Handler Middleware

/**
 * Handle 404 - Not Found errors
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists'
      });
    }

    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested record was not found'
      });
    }
  }

  // Default error response
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
};
