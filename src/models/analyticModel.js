
// notificationModels.js

import mongoose from 'mongoose';

const userAnalyticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al usuario
  
  userItineraryAnalytic: {
    totalCommentsCount: { type: Number, required: true, min: 0 },
    avgComments: { type: Number, required: true, min: 0 },
    totalReviewsCount: { type: Number, required: true, min: 0 },
    averageReviewScore: { type: Number, required: true, min: 0, max: 5 },
    bestItineraryByAvgReviewScore: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary', required: false }, // Referencia al mejor itinerario
  },

  userPublicationAnalytic: {
    totalCommentsCount: { type: Number, required: true, min: 0 },
    commentsPerPublication: { type: Number, required: true, min: 0 },
    totalLikesCount: { type: Number, required: true, min: 0 },
    averageLike: { type: Number, required: true, min: 0 },
    bestPublicationByLikeCount: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: false }, // Referencia a la mejor publicación
  },

  analysisDate: { type: Date, required: true, default: Date.now }, // Fecha de análisis
});

// Exportar el modelo
const UserAnalytic = mongoose.model('UserAnalytic', userAnalyticSchema);

export default {
  UserAnalytic
};