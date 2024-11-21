import { stdOptions } from './standardResponse.js';

// Common error itineraries
export class NotFoundError extends Error {
  constructor(message = 'Resource not found', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.notFound;
    this.statusCode = stdOptions.codes.notFound;
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Bad request', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.badRequest;
    this.statusCode = stdOptions.codes.badRequest;
  }
}

export class ValidationError extends Error {
  constructor(message = 'Validation failed', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.validationError;
    this.statusCode = stdOptions.codes.badRequest;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.unauthorized;
    this.statusCode = stdOptions.codes.unauthorized;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.forbidden;
    this.statusCode = stdOptions.codes.forbidden;
  }
}

export class InternalServerError extends Error {
  constructor(message = 'Internal server error', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.internalServerError;
    this.statusCode = stdOptions.codes.internalServerError;
  }
}

//bad json

export class BadJsonError extends Error {
  constructor(message = 'Bad JSON', details) {
    super(message);
    this.details = details;
    this.appCode = stdOptions.appCodes.badJson;
    this.statusCode = stdOptions.codes.badRequest;
  }
}
export default {
  NotFoundError,
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
};
