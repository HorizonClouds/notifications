import EventEmitter from 'events';

class NotificationEvents extends EventEmitter {
    constructor() {
        super();
    }

    // Emitir evento cuando se crea una nueva notificación
    emitNotificationCreated(notification) {
        this.emit('notificationCreated', notification);
    }

    // Emitir evento cuando se actualiza una notificación
    emitNotificationUpdated(notification) {
        this.emit('notificationUpdated', notification);
    }

    // Emitir evento cuando se elimina una notificación
    emitNotificationDeleted(notificationId) {
        this.emit('notificationDeleted', notificationId);
    }
}

const notificationEvents = new NotificationEvents();
export default notificationEvents;
