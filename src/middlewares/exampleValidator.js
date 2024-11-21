import { body, param, validationResult } from 'express-validator';
import { ValidationError } from '../utils/customErrors.js';

// Validation middleware for ExampleModel
export const validateExample = [
  // Validate 'name' field
  body('name')
    .exists({ checkNull: true })
    .withMessage('Name is required')
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long')
    .isLength({ max: 50 })
    .withMessage('Name must be at most 50 characters long'),

  // Validate 'value' field
  body('value')
    .exists({ checkNull: true })
    .withMessage('Value is required')
    .isNumeric()
    .withMessage('Value must be a number')
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number')
    
    ,

  // Middleware to handle validation errors
  (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }
      next();
    } catch (error) {
      res.sendError(new ValidationError('An error occurred while validating', [error]));
      return;
    }
  },
];
