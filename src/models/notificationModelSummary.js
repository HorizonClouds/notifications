import mongoose from 'mongoose';

// Definir el esquema de la vista materializada para las notificaciones
const notificationSummarySchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  unseenCount: { type: Number, default: 0 }, // Contador de notificaciones no vistas
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Crear el modelo de la vista materializada
const NotificationSummary = mongoose.model('NotificationSummary', notificationSummarySchema);

export default NotificationSummary;
