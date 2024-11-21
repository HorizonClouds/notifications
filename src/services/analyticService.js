import Models from '../models/analyticModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const getAnalyticById = async (id) => {
  try {
    const analytic = await Models.UserAnalytic.findById(id);
    if (!analytic) {
      throw new NotFoundError('Analytic not found');
    }
    return analytic;
  } catch (error) {
    throw new NotFoundError('Error fetching analytic by ID', error);
  }
};


export const getAnalyticByUserId = async (userId) => {
  try {
    const analyticByUser = await Models.UserAnalytic.find({ userId }); // Busca por userId
    if (!analyticByUser) {
      throw new NotFoundError('Analytic not found for the specified userId');
    }
    return analyticByUser;
  } catch (error) {
    throw new NotFoundError('Error fetching analytic by userId', error);
  }
};


//Obtener todas las notificaciones
export const getAllAnalytics = async () => {
  try {
    return await Models.UserAnalytic.find({});
  } catch (error) {
    throw new BadRequestError('Error fetching analytics', error);
  }
};

//Crear un análisis de itinerarios
export const createAnalytic = async (analyticData) => {
  try {
    const newAnalytic = new Models.UserAnalytic(analyticData);
    return await newAnalytic.save();
  } catch (error) {
    console.error('Error creating analytic:', error);
    throw new BadRequestError('Error creating analytic', error);
  }
};

// Leer análisis de itinerarios (con filtros opcionales)
export const getItineraryAnalytics = async (filters = {}) => {
  try {
    const { numberOfItineraryComments, commentsPerItinerary, numberOfItineraryRatings } = filters;
    return await Models.ItineraryAnalytic.find({ numberOfItineraryComments, commentsPerItinerary }, { numberOfItineraryRatings: 0, commentsPerItinerary: 0 }); //{numberOfItineraryRatings:1, commentsPerItinerary:1}
  } catch (error) {
    console.error('Error fetching itinerary analytics:', error);
    throw new BadRequestError('Error fetching itinerary analytics', error);
  }
};

export const getOrCreateAnalyticById = async (id, analyticData) => {
  try {
    let analytic = await Models.UserAnalytic.findById(id);

    if (analytic) {
      return analytic;
    }

    //este analytic data lo pasamos del servicio de manuel, atraves de axios.get 
    //para el usuario pasado.
    const newAnalytic = new Models.UserAnalytic({
      _id: id, // Usa el ID proporcionado para el nuevo análisis
      ...analyticData, // Usa los datos adicionales que se pasan
    });

    analytic = await newAnalytic.save(); // Guarda el nuevo análisis en la base de datos
    return analytic;
  } catch (error) {
    console.error('Error in getOrCreateAnalyticById:', error);
    throw new BadRequestError('Error fetching or creating analytic', error);
  }
};

export default {
  getAnalyticById,
  getAllAnalytics,
  createAnalytic,
  getAnalyticByUserId,
  getItineraryAnalytics,
  getOrCreateAnalyticById
};

