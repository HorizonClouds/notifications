// notificationModels.js

import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'], // Validation: Name is required
    minlength: [3, 'Name must be at least 3 characters long'], // Validation: Minimum length
    maxlength: [50, 'Name must be at most 50 characters long'], // Validation: Maximum length
  },
  value: {
    type: Number,
    required: [true, 'Value is required'], // Validation: Value is required
    min: [0, 'Value must be a positive number'], // Validation: Minimum value
  },
});


const ExampleModel = mongoose.model('Example', exampleSchema);

export default {
  ExampleModel
};
