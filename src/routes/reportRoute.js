import express from 'express';
import * as reportController from '../controllers/reportController.js';


const router = express.Router();

router.get('/v1/reports/:id', reportController.getReportById);
router.post('/v1/reports', reportController.createReport);
router.get('/v1/reports/user/:userId', reportController.getReportByUserId);

export default router;