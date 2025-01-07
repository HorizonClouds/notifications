import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js'; // Importar la vista materializada
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { sendEmail } from '../services/emailService.js';
import mongoose from 'mongoose'; // Asegúrate de importar mongoose
import logger from '../utils/logger.js';

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

export const createNotification = async (notificationData) => {
  try {
    // Validar que notificationData tenga los campos necesarios
    if (!notificationData.userId || !notificationData.notificationStatus) {
      throw new BadRequestError('Los datos de la notificación son incompletos: faltan userId o notificationStatus');
    }

    // Crear una nueva notificación
    const newNotification = new NotificationModel(notificationData);
    const createdNotification = await newNotification.save();

    // Si la notificación es no vista, actualizar la vista materializada
    if (createdNotification.notificationStatus === 'NOT SEEN') {
      await updateNotificationSummary(createdNotification.userId, 1);
    } else {
      await updateNotificationSummary(createdNotification.userId, 0);
    }

    

    //const user = await mongoose.connection.db.collection('users').findOne({ _id: mongoose.Types.ObjectId.createFromHexString(notificationData.userId) });
    //if (!user) {
    //  throw new Error('Usuario no encontrado');
    //}
    const email = "ismaelmesazyout@gmail.com";
    //const userName = user.name; 
    console.log("email", email);
    const message = "Tienes una nueva tarea pendiente.";
    const userName = "Ismael";
    // Enviar correo al usuario notificado
    const subject = `Nueva Notificación para ${userName || 'Usuario'}`;
    const text = `Hola ${userName || 'Usuario'}, tienes una nueva notificación: ${message}`;
    //<p>Hola ${notificationData.userName || 'Usuario'},</p>
    const html = `
      <p>Hola ${userName || 'Usuario'},</p>
      <p>Tienes una nueva notificación:</p>
      <strong>message</strong>
    `;

    if (email) {
      try {
        await sendEmail(email, subject, text, html);
        logger.info(`Correo enviado al usuario: ${email}`);
      } catch (emailError) {
        logger.info('Error al enviar el correo:', emailError.message);
      }
    } else {
      console.warn('No se proporcionó una dirección de correo electrónico para enviar la notificación.');
    }

    return createdNotification;
  } catch (error) {
    throw new BadRequestError('Error creating notification', error);
  }
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

export const getNotificationByUserId = async (userId) => {
  try {
    const notifications = await NotificationModel.find({ userId });

    if (!notifications || notifications.length === 0) {
      throw new NotFoundError('Notifications not found for the specified userId');
    }

    return notifications;
  } catch (error) {
    throw new NotFoundError('Error fetching notifications by userId', error);
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
    const notification = await NotificationModel.findById(id);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    const originalStatus = notification.notificationStatus;
    const updatedNotification = await NotificationModel.findByIdAndUpdate(id, updateData, { new: true });

    // Si la notificación pasa de "NOT SEEN" a "SEEN", actualizar la vista materializada
    if (originalStatus === 'NOT SEEN' && updatedNotification.notificationStatus === 'SEEN') {
      await updateNotificationSummary(notification.userId, -1);
    }

    return updatedNotification;
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

export const getNotificationSummaryByUserId = async (userId) => {
  try {
    const notificationSummary = await NotificationSummary.findOne({ userId });

    if (!notificationSummary) {
      throw new NotFoundError('Notification summary not found for the specified userId');
    }

    return notificationSummary;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new BadRequestError('Error fetching notification summary by userId', error);
  }
};

export default {
  getNotificationById,
  createNotification,
  getNotificationByUserId,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  getNotificationSummaryByUserId
};
