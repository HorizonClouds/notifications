import ExampleModel from '../models/exampleModel.js';
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const getAllExamples = async () => {
  try {
    return await ExampleModel.find({});
  } catch (error) {
    throw new BadRequestError('Error fetching examples', error);
  }
};

export const createExample = async (data) => {
  try {
    const newExample = new ExampleModel(data);
    return await newExample.save();
  } catch (error) {
    throw new BadRequestError('Error creating example', error);
  }
};

export const getExampleById = async (id) => {
  try {
    const example = await ExampleModel.findById(id);
    if (!example) {
      throw new NotFoundError('Example not found');
    }
    return example;
  } catch (error) {
    throw new NotFoundError('Error fetching example by ID', error);
  }
};

export const updateExample = async (id, data) => {
  try {
    const updatedExample = await ExampleModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!updatedExample) {
      throw new NotFoundError('Example not found');
    }
    return updatedExample;
  } catch (error) {
    throw new NotFoundError('Error updating example', error);
  }
};

export const deleteExample = async (id) => {
  try {
    const deletedExample = await ExampleModel.findByIdAndDelete(id);
    if (!deletedExample) {
      throw new NotFoundError('Example not found');
    }
    return deletedExample;
  } catch (error) {
    throw new NotFoundError('Error deleting example', error);
  }
};

export default {
  getAllExamples,
  createExample,
  getExampleById,
  updateExample,
  deleteExample,
};
