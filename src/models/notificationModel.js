import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true },
  config: {
    email: { type: Boolean, default: false }
  },
  type: {
    type: String,
    enum: ['itinerary', 'report', 'itinerary review', 'likes', 'pub comment', 'friend request', 'message'],
    required: true
  },
  resourceId: { type: String, required: true },
  notificationStatus: {
    type: String,
    enum: ['SEEN', 'NOT SEEN'],
    default: 'NOT SEEN'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

export default NotificationModel;