import notificationService from '../services/notificationService.js';
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

export const getNotificationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.getNotificationById(id);
        if (!notification) throw new NotFoundError('Notification not found');
        res.sendSuccess(removeMongoFields(notification));
    } catch (error) {
        next(error);
    }
};

export const createNotification = async (req, res, next) => {
    try {
        // Llamada al servicio para crear un nuevo análisis de itinerario
        const newNotification = await notificationService.createNotification(req.body);

        // Respuesta exitosa con los datos creados y mensaje
        res.sendSuccess(
            removeMongoFields(newNotification), // Limpia los campos internos de Mongo (_id, __v)
            'Itinerary Notification created successfully',
            201 // Código de estado HTTP para creación exitosa
        );
    } catch (error) {
        next(error);
    }
};

export const getNotificationByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Extrae userId de los parámetros de la solicitud
        const notificationByUser = await notificationService.getNotificationByUserId(userId); // Llama al servicio para buscar la analítica
        res.sendSuccess(notificationByUser); // Devuelve la analítica encontrada
    } catch (error) {
        next(error);
    }
};

export const getAllNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getAllNotifications();
        res.sendSuccess(removeMongoFields(notifications));
    } catch (error) {
        next(error);
    }
};