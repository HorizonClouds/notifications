import NotificationModel from '../models/notificationModel.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

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

export const createNotification = async (notificationData) => {
  try {
    const newNotification = new NotificationModel(notificationData);
    return await newNotification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new BadRequestError('Error creating notification', error);
  }
};

export const getNotificationByUserId = async (userId) => {
  try {
    const notificationByUser = await NotificationModel.find({ userId });
    if (!notificationByUser) {
      throw new NotFoundError('Notification not found for the specified userId');
    }
    return notificationByUser;
  } catch (error) {
    throw new NotFoundError('Error fetching notification by userId', error);
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