import notificationService from '../services/notificationService.js';
import { ThrottleManager } from '../utils/throttleManager.js';
import { FeatureToggleManager } from '../utils/featureToggleManager.js';
import { NotFoundError, ValidationError } from '../utils/customErrors.js';
import notificationEvents from '../utils/notificationEvents.js'; // Importar los eventos
import NotificationSummary from '../models/notificationModelSummary.js'; // Importar modelo de vista materializada

const throttleManager = new ThrottleManager();
const featureToggleManager = new FeatureToggleManager();

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

// Verificar si la funcionalidad de notificaciones está habilitada
const isNotificationsEnabled = () => {
  return featureToggleManager.isFeatureEnabled('notifications');
};

// Método para actualizar la vista materializada
const updateNotificationSummary = async (userId, increment) => {
  await NotificationSummary.findOneAndUpdate(
    { userId },
    { 
      $inc: { unseenCount: increment}, // Incrementar o decrementar el contador
      $set: { lastUpdated: new Date() }
    },
    { upsert: true } // Crear un nuevo documento si no existe
  );
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
      // Verificar si la funcionalidad de notificaciones está habilitada
      if (!isNotificationsEnabled()) {
          return res.status(400).json({ message: 'Notifications feature is disabled' });
      }

      const throttledCreateNotification = throttleManager.throttle(
          async () => {
              const newNotification = await notificationService.createNotification(req.body);
              notificationEvents.emitNotificationCreated(newNotification);

              if (newNotification.notificationStatus === 'NOT SEEN') {
                  await updateNotificationSummary(newNotification.userId, 0);
              }
              res.sendSuccess(
                  removeMongoFields(newNotification),
                  'Notification created successfully',
                  201
              );
          },
          10000,
          res
      );

      throttledCreateNotification();
  } catch (error) {
      next(error);
  }
};

export const getNotificationByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const notificationByUser = await notificationService.getNotificationByUserId(userId);
        res.sendSuccess(notificationByUser);
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

export const updateNotification = async (req, res, next) => {
    try {
      const { id } = req.params; 
      const updateData = req.body; 
      const updatedNotification = await notificationService.updateNotification(id, updateData);
  
      // Emitir evento de actualización de notificación
      notificationEvents.emitNotificationUpdated(updatedNotification);

      // Si se actualiza el estado de la notificación a "SEEN", decrementar el contador
      if (updatedNotification.notificationStatus === 'SEEN') {
        await updateNotificationSummary(updatedNotification.userId, 0);
      }

      res.sendSuccess(
        removeMongoFields(updatedNotification),
        'Notification updated successfully'
      );
    } catch (error) {
      next(error);
    }
};

export const deleteNotification = async (req, res, next) => {
  try {
      const { id } = req.params;

      const deletedNotification = await notificationService.deleteNotification(id);

      // Emitir evento de eliminación de notificación
      notificationEvents.emitNotificationDeleted(id);

      // Decrementar el contador de notificaciones no vistas sin importar el estado
      await updateNotificationSummary(deletedNotification.userId, 0);

      res.sendSuccess(
          removeMongoFields(deletedNotification),
          'Notification deleted successfully'
      );
  } catch (error) {
      next(error);
  }
};