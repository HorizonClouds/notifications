import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js';
import { createNotification, updateNotification, deleteNotification, getNotificationSummaryByUserId } from '../services/notificationService.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';
import { sendEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';

// Mock de los modelos y servicios
vi.mock('../models/notificationModel.js');
vi.mock('../models/notificationModelSummary.js');
vi.mock('../services/emailService.js');
vi.mock('../utils/logger.js');

describe('[Component] Notification Service', () => {
  const mockNotification = {
    _id: '63e2d6c1f1eabc1234567890',
    userId: '63e2d6c1f1eabc1234567891',
    config: { email: true },
    type: 'itinerary comment',
    resourceId: '63e2d6c1f1eabc1234567892',
    notificationStatus: 'NOT SEEN',
    createdAt: new Date(),
    userEmail: 'user@example.com', // Añadir userEmail
    message: 'Tienes un nuevo comentario en tu itinerario', // Añadir message
  };

  beforeEach(() => {
    mongoose.connection.db = { collection: vi.fn() }; // Mock de conexión DB
  });

  afterEach(() => {
    vi.clearAllMocks(); // Limpia todos los mocks después de cada prueba
  });

  it('[+] should create a new notification and update the notification summary', async () => {
    NotificationModel.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockNotification),
    }));
    
    NotificationSummary.findOneAndUpdate.mockResolvedValue({});
    const user = { _id: mockNotification.userId, email: 'user@example.com', name: 'Ismael' };

    // Mock de la función collection y findOne
    mongoose.connection.db.collection.mockReturnValue({
      findOne: vi.fn().mockResolvedValue(user),
    });

    const result = await createNotification(mockNotification);
    expect(result).toEqual(mockNotification);
    expect(NotificationModel).toHaveBeenCalledWith(mockNotification);
    expect(NotificationSummary.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: mockNotification.userId },
      { $inc: { unseenCount: 1 }, $set: { lastUpdated: expect.any(Date) } },
      { upsert: true }
    );
    expect(sendEmail).toHaveBeenCalledWith(
      'user@example.com',
      'Nueva Notificación para Ismael',
      'Hola Ismael, tienes una nueva notificación: Tienes una nueva tarea pendiente.',
      expect.any(String)
    );
    expect(logger.info).toHaveBeenCalledWith(`Correo enviado al usuario: user@example.com`);
  });

  it('[-] should throw BadRequestError when creating a notification fails', async () => {
    NotificationModel.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error('Failed to save notification')),
    }));

    await expect(createNotification(mockNotification)).rejects.toThrow(BadRequestError);
  });

  it('[+] should not update notification summary if notificationStatus is not seen', async () => {
    const mockNotification = {
      _id: 'mock-id',
      userId: 'user-id',
      notificationStatus: 'NOT SEEN',
    };
  
    const updatedNotification = { ...mockNotification, notificationStatus: 'NOT SEEN' };  // No cambia el estado
    NotificationModel.findById = vi.fn().mockResolvedValue(mockNotification); // Mock de findById
    NotificationModel.findByIdAndUpdate = vi.fn().mockResolvedValue(updatedNotification); // Mock de findByIdAndUpdate
    const mockUpdateNotificationSummary = vi.fn();
    NotificationSummary.mockImplementation(mockUpdateNotificationSummary);
  
    const result = await updateNotification(mockNotification._id, { notificationStatus: 'NOT SEEN' });
  
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNotification._id,
      { notificationStatus: 'NOT SEEN' },
      { new: true }
    );
  
    expect(mockUpdateNotificationSummary).not.toHaveBeenCalled();
  });

  it('[+] should update an existing notification and update notification summary if seen', async () => {
    const updatedNotification = { ...mockNotification, notificationStatus: 'SEEN' };
    NotificationModel.findById = vi.fn().mockResolvedValue(mockNotification); // Mock de findById
    NotificationModel.findByIdAndUpdate = vi.fn().mockResolvedValue(updatedNotification); // Mock de findByIdAndUpdate
    NotificationSummary.findOneAndUpdate = vi.fn().mockResolvedValue({});

    const result = await updateNotification(mockNotification._id, { notificationStatus: 'SEEN' });
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNotification._id,
      { notificationStatus: 'SEEN' },
      { new: true }
    );
    expect(NotificationSummary.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: mockNotification.userId },
      { $inc: { unseenCount: -1 }, $set: { lastUpdated: expect.any(Date) } },
      { upsert: true }
    );
  });

  it('[+] should update an existing notification but not update notification summary if no status change', async () => {
    const updatedNotification = { ...mockNotification, config: { email: false } };

    NotificationModel.findByIdAndUpdate.mockResolvedValue(updatedNotification);

    const result = await updateNotification(mockNotification._id, { config: { email: false } });
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNotification._id,
      { config: { email: false } },
      { new: true }
    );
    expect(NotificationSummary.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('[-] should throw NotFoundError when updating a non-existent notification', async () => {
    NotificationModel.findById = vi.fn().mockResolvedValue(null); // Mock de findById para devolver null
    NotificationModel.findByIdAndUpdate = vi.fn(); // Aseguramos que findByIdAndUpdate sea llamado

    await expect(updateNotification('nonexistentId', { notificationStatus: 'SEEN' })).rejects.toThrow(NotFoundError);
    expect(NotificationModel.findByIdAndUpdate).not.toHaveBeenCalled(); // Aseguramos que no se llame a findByIdAndUpdate
  });

  it('[+] should delete an existing notification and update the notification summary', async () => {
    NotificationModel.findByIdAndDelete.mockResolvedValue(mockNotification);
    NotificationSummary.findOneAndUpdate.mockResolvedValue({});
  
    const result = await deleteNotification(mockNotification._id);
  
    expect(result).toEqual(mockNotification);
    expect(NotificationModel.findByIdAndDelete).toHaveBeenCalledWith(mockNotification._id);
    expect(NotificationSummary.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: mockNotification.userId },
      { $inc: { unseenCount: -1 }, $set: { lastUpdated: expect.any(Date) } },
      { upsert: true }
    );
  });

  it('[-] should throw NotFoundError when deleting a non-existent notification', async () => {
    NotificationModel.findByIdAndDelete.mockResolvedValue(null);

    await expect(deleteNotification('nonexistentId')).rejects.toThrow(NotFoundError);
    expect(NotificationModel.findByIdAndDelete).toHaveBeenCalledWith('nonexistentId');
  });

  it('[+] should GET notification summary by user ID', async () => {
    NotificationSummary.findOne.mockResolvedValue({
      userId: mockNotification.userId,
      unseenCount: 1,
      lastUpdated: new Date(),
    });

    const result = await getNotificationSummaryByUserId(mockNotification.userId);
    expect(result).not.toBeNull();
    expect(result.userId).toBe(mockNotification.userId);
    expect(result.unseenCount).toBe(1);
  });

  it('[-] should return NOT FOUND for getting notification summary by non-existent user ID', async () => {
    NotificationSummary.findOne.mockResolvedValue(null);

    const invalidUserId = new mongoose.Types.ObjectId().toString();
    await expect(getNotificationSummaryByUserId(invalidUserId)).rejects.toThrow(NotFoundError);
  });

});
