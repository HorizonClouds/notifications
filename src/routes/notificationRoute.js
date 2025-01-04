import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { checkAuth, checkPlan, checkRole, checkAddon } from '../middlewares/authMiddleware.js';


const router = express.Router();

router.get('/v1/notifications/:id', notificationController.getNotificationById);
router.post('/v1/notifications', checkAuth(), notificationController.createNotification);
router.get('/v1/notifications/user/:userId', notificationController.getNotificationByUserId);
router.get('/v1/notifications', notificationController.getAllNotifications);

router.put('/v1/notifications/:id', checkAuth(), notificationController.updateNotification);
router.delete('/v1/notifications/:id', checkAuth(), notificationController.deleteNotification);
export default router;