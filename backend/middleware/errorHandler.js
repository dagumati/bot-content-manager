const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token',
      status: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Token expired',
      status: 401
    };
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = {
      message: 'Validation failed',
      status: 400,
      details: err.details || err.message
    };
  }

  // Google Sheets API errors
  if (err.message.includes('Google Sheet')) {
    error = {
      message: err.message,
      status: 500
    };
  }

  // Duplicate key error
  if (err.message.includes('duplicate') || err.message.includes('already exists')) {
    error = {
      message: 'Key already exists',
      status: 409
    };
  }

  // Not found error
  if (err.message.includes('not found') || err.message.includes('Not found')) {
    error = {
      message: err.message,
      status: 404
    };
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };

