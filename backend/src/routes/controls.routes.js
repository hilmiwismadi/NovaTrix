// Controls Routes

import express from 'express';
import {
  getControls,
  getControlById
} from '../controllers/controlsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/controls
 * @desc    Get all Annex A controls
 * @access  Private
 */
router.get('/', authenticateToken, getControls);

/**
 * @route   GET /api/controls/:id
 * @desc    Get control by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, getControlById);

export default router;
