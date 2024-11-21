import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Referencia al usuario que realiza el reporte
    type: { 
      type: String, 
      enum: ['publication', 'itinerary'], // Tipos permitidos: "publication" o "itinerary"
      required: true 
    },
    reason: { type: String, required: true }, // Razón del reporte
  }, {
    timestamps: true, // Añade automáticamente createdAt y updatedAt
  });


  const Report = mongoose.model('Report', reportSchema);

export default {
  Report
};