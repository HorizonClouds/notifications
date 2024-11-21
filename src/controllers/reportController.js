import reportService from '../services/reportService.js';
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
export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);
    if (!report) throw new NotFoundError('Report not found');
    res.sendSuccess(removeMongoFields(report));
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
    try {
      // Llamada al servicio para crear un nuevo análisis de itinerario
      const newReport = await reportService.createReport(req.body);
  
      // Respuesta exitosa con los datos creados y mensaje
      res.sendSuccess(
        removeMongoFields(newReport), // Limpia los campos internos de Mongo (_id, __v)
        'Itinerary Report created successfully',
        201 // Código de estado HTTP para creación exitosa
      );
    } catch (error) {
      next(error);
    }
};

export const getReportByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extrae userId de los parámetros de la solicitud
    const reportByUser = await reportService.getReportByUserId(userId); // Llama al servicio para buscar la analítica
    res.sendSuccess(reportByUser); // Devuelve la analítica encontrada
  } catch (error) {
    next(error);
  }
};