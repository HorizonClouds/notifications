import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js'; // Importar la vista materializada
import { NotFoundError, BadRequestError } from '../errors/index.js';

// Función para actualizar la vista materializada
const updateNotificationSummary = async (userId, increment) => {
  await NotificationSummary.findOneAndUpdate(
    { userId },
    { 
      $inc: { unseenCount: increment }, // Incrementar o decrementar el contador
      $set: { lastUpdated: new Date() }
    },
    { upsert: true } // Crear un nuevo documento si no existe
  );
};

export const getNotificationById = async (id) => {
  try {
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }
    return notification;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching notification by ID', error);
  }
};

export const createNotification = async (notificationData) => {
  try {
    const newNotification = new NotificationModel(notificationData);
    const createdNotification = await newNotification.save();

    // Si la notificación es no vista, actualizar la vista materializada
    if (createdNotification.notificationStatus === 'NOT SEEN') {
      await updateNotificationSummary(createdNotification.userId, 1);
    }

    return createdNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new BadRequestError('Error creating notification', error);
  }
};

export const getNotificationByUserId = async (userId) => {
  try {
    const notificationByUser = await NotificationModel.find({ userId });
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
    return await NotificationModel.find({});
  } catch (error) {
    throw new BadRequestError('Error fetching notifications', error);
  }
};

export const updateNotification = async (id, updateData) => {
  try {
    const notification = await NotificationModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Si la notificación se marca como "SEEN", actualizar la vista materializada
    if (updateData.notificationStatus && updateData.notificationStatus === 'SEEN' && notification.notificationStatus !== 'SEEN') {
      await updateNotificationSummary(notification.userId, -1);
    }

    return notification;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error updating notification', error);
  }
};

export const deleteNotification = async (id) => {
  try {
    const notification = await NotificationModel.findByIdAndDelete(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Actualizamos la vista materializada independientemente del estado de la notificación
    await updateNotificationSummary(notification.userId, -1);

    return notification;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error deleting notification', error);
  }
};


export default {
  getNotificationById,
  createNotification,
  getNotificationByUserId,
  getAllNotifications,
  updateNotification,
  deleteNotification
};
