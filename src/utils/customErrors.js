class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends CustomError {
  constructor(message = 'Validation error') {
    super(message, 400); // HTTP 400 Bad Request
  }
}

export class AuthenticationError extends CustomError {
  constructor(message = 'Authentication failed') {
    super(message, 401); // HTTP 401 Unauthorized
  }
}

export class AuthorizationError extends CustomError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403); // HTTP 403 Forbidden
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, 404); // HTTP 404 Not Found
  }
}

export class BadRequestError extends CustomError {
  constructor(message = 'Bad request', originalError = null) {
    super(message, 400); // HTTP 400 Bad Request
    if (originalError) {
      this.details = originalError.message || originalError;
    }
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal server error') {
    super(message, 500); // HTTP 500 Internal Server Error
  }
}

export class BadJsonError extends CustomError {
  constructor(message = 'Invalid JSON format') {
    super(message, 400); // HTTP 400 Bad Request
  }
}

// Middleware para manejar errores y enviar una respuesta adecuada
export const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message || 'Internal server error',
  };

  // Incluir detalles adicionales en modo desarrollo
  if (process.env.NODE_ENV === 'development' && err.details) {
    response.details = err.details;
  }

  res.status(statusCode).json(response);
};
