import { describe, it, expect, vi, afterEach } from 'vitest';
import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js';
import { createNotification, updateNotification, deleteNotification } from '../services/notificationService.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

// Mock de los modelos
vi.mock('../models/notificationModel.js');
vi.mock('../models/notificationModelSummary.js');

describe('[Component] Notification Service', () => {
  const mockNotification = {
    _id: '63e2d6c1f1eabc1234567890',
    userId: '63e2d6c1f1eabc1234567891',
    config: { email: true },
    type: 'itinerary comment',
    resourceId: '63e2d6c1f1eabc1234567892',
    notificationStatus: 'NOT SEEN',
    createdAt: new Date(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('[+] should create a new notification and update the notification summary', async () => {
    NotificationModel.mockImplementation(() => ({
      save: vi.fn().mockResolvedValue(mockNotification),
    }));
    
    NotificationSummary.findOneAndUpdate.mockResolvedValue({});

    const result = await createNotification(mockNotification);
    expect(result).toEqual(mockNotification);
    expect(NotificationModel).toHaveBeenCalledWith(mockNotification);
    expect(NotificationSummary.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: mockNotification.userId },
      { $inc: { unseenCount: 1 }, $set: { lastUpdated: expect.any(Date) } },
      { upsert: true }
    );
  });

  it('[-] should throw BadRequestError when creating a notification fails', async () => {
    NotificationModel.mockImplementation(() => ({
      save: vi.fn().mockRejectedValue(new Error('Failed to save notification')),
    }));

    await expect(createNotification(mockNotification)).rejects.toThrow(BadRequestError);
  });

  it('[+] should not update notification summary if notificationStatus is not seen', async () => {
  
    const updatedNotification = { ...mockNotification, notificationStatus: 'NOT SEEN' };  // No cambia el estado
    NotificationModel.findById.mockResolvedValue(mockNotification);
    NotificationModel.findByIdAndUpdate.mockResolvedValue(updatedNotification);
    const mockUpdateNotificationSummary = vi.fn();
    NotificationSummary.mockImplementation(mockUpdateNotificationSummary);
  
    const result = await updateNotification(mockNotification._id, { notificationStatus: 'NOT SEEN' });
  
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findById).toHaveBeenCalledWith(mockNotification._id);
    expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNotification._id,
      { notificationStatus: 'NOT SEEN' },
      { new: true }
    );
    expect(mockUpdateNotificationSummary).not.toHaveBeenCalled();
  });

  it('[+] should update an existing notification and update notification summary if seen', async () => {

    const updatedNotification = { ...mockNotification, notificationStatus: 'SEEN' };
    NotificationModel.findById.mockResolvedValue(mockNotification);
    NotificationModel.findByIdAndUpdate.mockResolvedValue(updatedNotification);
    NotificationSummary.findOneAndUpdate.mockResolvedValue({});

    const result = await updateNotification(mockNotification._id, { notificationStatus: 'SEEN' });
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findById).toHaveBeenCalledWith(mockNotification._id);
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

    NotificationModel.findById.mockResolvedValue(mockNotification);
    NotificationModel.findByIdAndUpdate.mockResolvedValue(updatedNotification);

    const result = await updateNotification(mockNotification._id, { config: { email: false } });
    expect(result).toEqual(updatedNotification);
    expect(NotificationModel.findById).toHaveBeenCalledWith(mockNotification._id);
    expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
      mockNotification._id,
      { config: { email: false } },
      { new: true }
    );
    expect(NotificationSummary.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it('[-] should throw NotFoundError when updating a non-existent notification', async () => {
    NotificationModel.findById.mockResolvedValue(null);

    await expect(updateNotification('nonexistentId', { notificationStatus: 'SEEN' })).rejects.toThrow(NotFoundError);
    expect(NotificationModel.findById).toHaveBeenCalledWith('nonexistentId');
    expect(NotificationModel.findByIdAndUpdate).not.toHaveBeenCalled();
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

  
});