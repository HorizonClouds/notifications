import notificationEvents from './notificationEvents.js'; // Ruta del archivo de eventos
import NotificationModel from '../models/notificationModel.js'; // Modelo de notificación

// Escuchar el evento de creación de notificación
notificationEvents.on('notificationCreated', async (notification) => {
    try {
        // Aquí, simplemente guardamos la notificación en la base de datos
        await NotificationModel.create(notification);
        console.log('Notificación creada y vista materializada actualizada');
    } catch (error) {
        console.error('Error al actualizar la vista materializada al crear notificación:', error);
    }
});

// Escuchar el evento de actualización de notificación
notificationEvents.on('notificationUpdated', async (notification) => {
    try {
        // Actualizar la notificación en la vista materializada
        await NotificationModel.findByIdAndUpdate(notification._id, notification);
        console.log('Notificación actualizada y vista materializada actualizada');
    } catch (error) {
        console.error('Error al actualizar la vista materializada al actualizar notificación:', error);
    }
});

// Escuchar el evento de eliminación de notificación
notificationEvents.on('notificationDeleted', async (notificationId) => {
    try {
        // Eliminar la notificación de la vista materializada
        await NotificationModel.findByIdAndDelete(notificationId);
        console.log('Notificación eliminada y vista materializada actualizada');
    } catch (error) {
        console.error('Error al actualizar la vista materializada al eliminar notificación:', error);
    }
});
