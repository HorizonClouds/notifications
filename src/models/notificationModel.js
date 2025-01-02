import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al usuario
    config: {
        email: { type: Boolean, default: false } // Configuración de notificaciones por correo
    },
    type: {
        type: String,
        enum: ['itinerary comment', 'report', 'itinerary review', 'likes', 'pub comment', 'friend request', 'message'], // Tipos de notificaciones
        required: true
    },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID del recurso asociado
    notificationStatus: {
        type: String,
        enum: ['SEEN', 'NOT SEEN'], // Estado de la notificación
        default: 'NOT SEEN'
    },
    createdAt: { type: Date, default: Date.now } // Fecha de creación
}, {
    timestamps: true // Añade automáticamente createdAt y updatedAt
});


const Notification = mongoose.model('Notification', notificationSchema);

export default {
    Notification
};