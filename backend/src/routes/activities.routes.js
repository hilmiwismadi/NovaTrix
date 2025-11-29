// Activities Routes

import express from 'express';
import { getRecentActivities } from '../controllers/activitiesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/activities/recent
 * @desc    Get recent activities
 * @access  Private
 */
router.get('/recent', authenticateToken, getRecentActivities);

export default router;
