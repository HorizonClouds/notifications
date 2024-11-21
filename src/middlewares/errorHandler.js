// This will catch errors thrown by the application and send a response to the client with the error message and status code.

import { sendError } from '../utils/standardResponse.js';

const errorHandler = (error, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('Error handler middleware');
    console.error(error.message);
  }
  sendError(res, error);
};

export default errorHandler;
