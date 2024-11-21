import exampleService from '../services/exampleService.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';

const removeMongoFields = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => {
      const { __v, ...rest } = item.toObject();
      return rest;
    });
  } else {
    const { __v, ...rest } = data.toObject();
    return rest;
  }
};

export const getAllExamples = async (req, res, next) => {
  try {
    const examples = await exampleService.getAllExamples();
    res.sendSuccess(removeMongoFields(examples));
  } catch (error) {
    next(error);
  }
};

export const createExample = async (req, res, next) => {
  try {
    const newExample = await exampleService.createExample(req.body);
    res.sendSuccess(
      removeMongoFields(newExample),
      'Example created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getExampleById = async (req, res, next) => {
  try {
    const example = await exampleService.getExampleById(req.params.id);
    if (!example) throw new NotFoundError('Example not found');
    res.sendSuccess(removeMongoFields(example));
  } catch (error) {
    next(error);
  }
};

export const updateExample = async (req, res, next) => {
  try {
    let data = req.body;
    // remove _id field from data
    delete data._id;
    const updatedExample = await exampleService.updateExample(
      req.params.id,
      data
    );
    if (!updatedExample) throw new NotFoundError('Example not found');
    res.sendSuccess(
      removeMongoFields(updatedExample),
      'Example updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const deleteExample = async (req, res, next) => {
  try {
    const deletedExample = await exampleService.deleteExample(req.params.id);
    if (!deletedExample) throw new NotFoundError('Example not found');
    res.sendSuccess(null, 'Example deleted successfully', 204);
  } catch (error) {
    next(error);
  }
};
