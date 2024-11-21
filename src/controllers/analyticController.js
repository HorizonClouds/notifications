import analyticService from '../services/analyticService.js';
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
export const getAnalyticById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const analytic = await analyticService.getAnalyticById(id);
    if (!analytic) throw new NotFoundError('Analytic not found');
    res.sendSuccess(removeMongoFields(analytic));
  } catch (error) {
    next(error);
  }
};
export const createAnalytic = async (req, res, next) => {
    try {
      // Llamada al servicio para crear un nuevo análisis de itinerario
      const newAnalytic = await analyticService.createAnalytic(req.body);
  
      // Respuesta exitosa con los datos creados y mensaje
      res.sendSuccess(
        removeMongoFields(newAnalytic), // Limpia los campos internos de Mongo (_id, __v)
        'Analytic created successfully',
        201 // Código de estado HTTP para creación exitosa
      );
    } catch (error) {
      next(error);
    }
};

export const getAnalyticByUserId = async (req, res) => {
  try {
    const { userId } = req.params; // Extrae userId de los parámetros de la solicitud
    const analyticByUser = await analyticService.getAnalyticByUserId(userId); // Llama al servicio para buscar la analítica
    res.sendSuccess(analyticByUser); // Devuelve la analítica encontrada
  } catch (error) {
    next(error);
  }
};
 
export const getAllAnalytics = async (req, res, next) => {
  try {
      const analytics = await analyticService.getAllAnalytics();
      res.sendSuccess(removeMongoFields(analytics));
  } catch (error) {
    next(error);
  }
};

export const getItineraryAnalytics = async (req, res, next) => {
    try {
      const filters = req.query; // Filtros opcionales enviados en la solicitud
      const analytics = await analyticService.getItineraryAnalytics(filters);
      res.sendSuccess(analytics);
    } catch (error) {
      next(error);
    }
};
  
export const getOrCreateAnalytic = async (req, res) => {
  try {
    const { id } = req.params;
    const analyticData = req.body;

    // Llama al servicio para buscar o crear el análisis
    const analytic = await analyticService.getOrCreateAnalyticById(id, analyticData);
    res.status(200).json({
      message: 'Analytic fetched or created successfully',
      data: analytic,
    });
  } catch (error) {
    res.status(400).json({
      message: 'Error fetching or creating analytic',
      error: error.message,
    });
  }
};

//export const updateItineraryAnalytic = async (req, res, next) => {
//  try {
//    const { id } = req.params; // ID del análisis a actualizar
//    const updateData = req.body;
//    const updatedAnalytic = await analyticService.updateItineraryAnalytic(id, updateData);
//    res.sendSuccess(updatedAnalytic);
//  } catch (error) {
//    next(error);
//  }
//};

//export const deleteItineraryAnalytic = async (req, res, next) => {
//  try {
//    const { id } = req.params;
//    await analyticService.deleteItineraryAnalytic(id);
//    res.sendSuccess({ message: 'Itinerary analytic deleted successfully' });
//  } catch (error) {
//    next(error);
//  }
//};