// Interview Routes

import express from 'express';
import {
  getInterviews,
  getInterviewById,
  createInterview,
  updateInterview,
  deleteInterview,
  getRespondents,
  getQuestionBank,
  getInterviewStats
} from '../controllers/interviewsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Interview routes
router.get('/stats', authenticateToken, getInterviewStats);
router.get('/', authenticateToken, getInterviews);
router.get('/:id', authenticateToken, getInterviewById);
router.post('/', authenticateToken, createInterview);
router.put('/:id', authenticateToken, updateInterview);
router.delete('/:id', authenticateToken, deleteInterview);

// Respondent routes
router.get('/respondents/all', authenticateToken, getRespondents);

// Question bank routes
router.get('/questions/bank', authenticateToken, getQuestionBank);

export default router;
