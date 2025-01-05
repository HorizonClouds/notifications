import mongoose from 'mongoose';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  getAllNotifications,
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getNotificationByUserId,
} from '../services/notificationService.js';
import NotificationModel from '../models/notificationModel.js';

//PRUEBA DE COMPONENTES 

import { createNotification } from '../services/notificationService.js';
import NotificationModel from '../models/notificationModel.js';
import NotificationSummary from '../models/notificationModelSummary.js';
import { BadRequestError } from '../errors/index.js';
import { ThrottleManager } from '../utils/throttleManager.js';
import { getNotificationById } from '../services/notificationService.js';
import NotificationModel from '../models/notificationModel.js';
import { NotFoundError } from '../errors/index.js';
import { getNotificationByUserId } from '../services/notificationService.js';
import NotificationModel from '../models/notificationModel.js';
import { NotFoundError } from '../errors/index.js';

const exampleNotification = {
  userId: new mongoose.Types.ObjectId(),
  config: { email: true },
  type: 'likes',
  resourceId: new mongoose.Types.ObjectId(),
  notificationStatus: 'NOT SEEN',
  createdAt: new Date(),
};

const anotherNotification = {
  userId: new mongoose.Types.ObjectId(),
  config: { email: false },
  type: 'friend request',
  resourceId: new mongoose.Types.ObjectId(),
  notificationStatus: 'SEEN',
  createdAt: new Date(),
};

describe('[Integration][Service] Notification Tests', () => {
  let mongoServer;
  let notificationId;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    const notification = await createNotification(exampleNotification);
    notificationId = notification._id.toString();

    // Crear NotificationSummary para el usuario
    await NotificationSummary.create({
      userId: exampleNotification.userId,
      unseenCount: 1,
      lastUpdated: new Date(),
    });
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('[+] should CREATE a notification', async () => {
    const result = await createNotification(anotherNotification);
    expect(result.userId.toString()).toBe(anotherNotification.userId.toString());
    expect(result.config.email).toBe(anotherNotification.config.email);
    expect(result.type).toBe(anotherNotification.type);
    expect(result.resourceId.toString()).toBe(anotherNotification.resourceId.toString());
    expect(result.notificationStatus).toBe(anotherNotification.notificationStatus);
    expect(result.createdAt).toBeInstanceOf(Date);

    const dbNotification = await NotificationModel.findById(result._id);
    expect(dbNotification).not.toBeNull();
    expect(dbNotification.userId.toString()).toBe(anotherNotification.userId.toString());
    expect(dbNotification.config.email).toBe(anotherNotification.config.email);
    expect(dbNotification.type).toBe(anotherNotification.type);
    expect(dbNotification.resourceId.toString()).toBe(anotherNotification.resourceId.toString());
    expect(dbNotification.notificationStatus).toBe(anotherNotification.notificationStatus);
    expect(dbNotification.createdAt).toBeInstanceOf(Date);

  });

  it('[+] should GET a notification by ID', async () => {
    const result = await getNotificationById(notificationId);
    expect(result._id.toString()).toBe(notificationId);
    expect(result.type).toBe(exampleNotification.type);

    const dbNotification = await NotificationModel.findById(notificationId);
    expect(dbNotification).not.toBeNull();
    expect(dbNotification.type).toBe(exampleNotification.type);
  });

  it('[+] should GET all notifications', async () => {
    const result = await getAllNotifications();
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe(exampleNotification.type);
  });

  it('[+] should UPDATE a notification', async () => {
    const updatedData = { notificationStatus: 'SEEN' };
    const result = await updateNotification(notificationId, updatedData);
    expect(result.notificationStatus).toBe('SEEN');

    const dbNotification = await NotificationModel.findById(notificationId);
    expect(dbNotification.notificationStatus).toBe('SEEN');
  });

  it('[-] should return NOT FOUND for non-existent notification ID', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    await expect(getNotificationById(invalidId.toString())).rejects.toThrow('Notification not found');
  });

  it('[-] should return NOT FOUND for updating a non-existent notification', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const updatedData = { notificationStatus: 'SEEN' };
    await expect(updateNotification(invalidId.toString(), updatedData)).rejects.toThrow('Notification not found');
  });

  it('[+] should DELETE a notification', async () => {
    const result = await deleteNotification(notificationId);
    expect(result._id.toString()).toBe(notificationId);

    const dbNotification = await NotificationModel.findById(notificationId);
    expect(dbNotification).toBeNull();
  });

  it('[-] should return NOT FOUND for deleting a non-existent notification', async () => {
    const invalidId = new mongoose.Types.ObjectId();
    await expect(deleteNotification(invalidId.toString())).rejects.toThrow('Notification not found');
  });

  it('[+] should GET notifications by user ID', async () => {
    const result = await getNotificationByUserId(exampleNotification.userId.toString());
    expect(result).toHaveLength(1);
    expect(result[0].userId.toString()).toBe(exampleNotification.userId.toString());
    expect(result[0].type).toBe(exampleNotification.type);
  });

  it('[-] should return NOT FOUND for getting notifications by non-existent user ID', async () => {
    const invalidUserId = new mongoose.Types.ObjectId();
    await expect(getNotificationByUserId(invalidUserId.toString())).rejects.toThrow(NotFoundError);
  });

});

//PRUEBA DE COMPONENTES
