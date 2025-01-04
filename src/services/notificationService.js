import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js'; // Importar la vista materializada
import { NotFoundError, BadRequestError } from '../errors/index.js';
import redisClient from '../utils/redisClient.js';
import { CACHE_TTL } from '../utils/config.js';

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
    // Crear una nueva notificación
    const newNotification = new NotificationModel(notificationData);
    const createdNotification = await newNotification.save();

    // Si la notificación es no vista, actualizar la vista materializada
    if (createdNotification.notificationStatus === 'NOT SEEN') {
      await updateNotificationSummary(createdNotification.userId, 1);
    }

    // Solo almacenar en caché si la notificación es 'SEEN'
    if (createdNotification.notificationStatus === 'SEEN') {
      // **Actualizar la caché**: La caché debe reflejar la nueva notificación
      const cacheKey = `notification:${createdNotification._id}`;
      await redisClient.set(cacheKey, JSON.stringify(createdNotification), 'EX', CACHE_TTL);

      // Si la notificación es para un usuario específico, también debes actualizar la caché para las notificaciones del usuario
      const userCacheKey = `notifications:user:${createdNotification.userId}`;
      const cachedUserNotifications = await redisClient.get(userCacheKey);
      if (cachedUserNotifications) {
        const notifications = JSON.parse(cachedUserNotifications);
        notifications.push(createdNotification); // Agregar la nueva notificación al arreglo
        await redisClient.set(userCacheKey, JSON.stringify(notifications), 'EX', CACHE_TTL);
      } else {
        // Si no existe en caché, entonces se crea el primer valor
        await redisClient.set(userCacheKey, JSON.stringify([createdNotification]), 'EX', CACHE_TTL);
      }
    }

    return createdNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new BadRequestError('Error creating notification', error);
  }
};

// Función para obtener notificación por ID, con caché primero
export const getNotificationById = async (id) => {
  try {
    const cacheKey = `notification:${id}`;

    // Verificar si los datos están en la caché
    const cachedNotification = await redisClient.get(cacheKey);

    if (cachedNotification) {
      console.log('Cache hit for notification:', id);
      
      // Si está en caché, retornamos los datos directamente de la caché
      const notificationObject = JSON.parse(cachedNotification);
      
      // Convertir el objeto de caché a un objeto Mongoose si es necesario
      const notification = new NotificationModel(notificationObject);
      return notification;
    }

    // Si no está en la caché, realizamos la consulta a la base de datos
    console.log('Cache miss for notification:', id);
    const notification = await NotificationModel.findById(id);
    
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    // Guardamos la respuesta en la caché para futuras consultas
    await redisClient.set(cacheKey, JSON.stringify(notification), 'EX', CACHE_TTL);

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
    const cacheKey = `notifications:user:${userId}`;

    // Verificar si las notificaciones están en la caché
    const cachedNotifications = await redisClient.get(cacheKey);
    
    if (cachedNotifications) {
      console.log('Cache hit for user notifications:', userId);
      return JSON.parse(cachedNotifications); // Si están en la caché, devolverlas
    }

    console.log('Cache miss for user notifications:', userId);

    // Si no están en la caché, obtenerlas de la base de datos
    const notifications = await NotificationModel.find({ userId });
    if (!notifications || notifications.length === 0) {
      throw new NotFoundError('Notifications not found for the specified userId');
    }

    // Guardar las notificaciones en la caché
    await redisClient.set(cacheKey, JSON.stringify(notifications), 'EX', CACHE_TTL);
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
