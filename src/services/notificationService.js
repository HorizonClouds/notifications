import Models from '../models/notificationModel.js'; // Importa el objeto de modelos
import { NotFoundError, BadRequestError } from '../utils/customErrors.js';

export const getNotificationById = async (id) => {
    try {
        const notification = await Models.Notification.findById(id);
        if (!notification) {
            throw new NotFoundError('Notification not found');
        }
        return notification;
    } catch (error) {
        throw new NotFoundError('Error fetching notification by ID', error);
    }
};

export const createNotification = async (notificationData) => {
    try {
        const newNotification = new Models.Notification(notificationData);
        return await newNotification.save();
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new BadRequestError('Error creating notification', error);
    }
};

export const getNotificationByUserId = async (userId) => {
    try {
        const notificationByUser = await Models.Notification.find({ userId }); // Busca por userId
        if (!notificationByUser) {
            throw new NotFoundError('Notification not found for the specified userId');
        }
        return notificationByUser;
    } catch (error) {
        throw new NotFoundError('Error fetching notification by userId', error);
    }
};

export const getAllNotifications = async () => {
    try {
      return await Models.Notification.find({});
    } catch (error) {
      throw new BadRequestError('Error fetching notifications', error);
    }
  };

export default {
    getNotificationById,
    createNotification,
    getNotificationByUserId,
    getAllNotifications
};