import Models from '../models/reportModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const getReportById = async (id) => {
  try {
    const report = await Models.Report.findById(id);
    if (!report) {
      throw new NotFoundError('Report not found');
    }
    return report;
  } catch (error) {
    throw new NotFoundError('Error fetching report by ID', error);
  }
};

export const getReportByUserId = async (userId) => {
  try {
    const reportByUser = await Models.Report.find({ userId }); // Busca por userId
    if (!reportByUser) {
      throw new NotFoundError('Report not found for the specified userId');
    }
    return reportByUser;
  } catch (error) {
    throw new NotFoundError('Error fetching report by userId', error);
  }
};

export const createReport = async (reportData) => {
    try {
      const newReport = new Models.Report(reportData);
      return await newReport.save();
    } catch (error) {
      console.error('Error creating report:', error);
      throw new BadRequestError('Error creating report', error);
    }
  };

export default {
    getReportById,
    createReport,
    getReportByUserId
  };
  