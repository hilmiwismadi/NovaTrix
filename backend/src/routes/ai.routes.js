import express from 'express';
import { chat, getStatus, clearSession, getStats } from '../controllers/aiChatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat
 * @desc    Send message to AI and get response
 * @access  Private
 */
router.post('/chat', authenticateToken, chat);

/**
 * @route   GET /api/ai/status
 * @desc    Check if AI service is online and model is loaded
 * @access  Private
 */
router.get('/status', authenticateToken, getStatus);

/**
 * @route   GET /api/ai/logs/stats
 * @desc    Get AI interaction statistics
 * @access  Private
 */
router.get('/logs/stats', authenticateToken, getStats);

/**
 * @route   DELETE /api/ai/session/:sessionId
 * @desc    Clear chat session history
 * @access  Private
 */
router.delete('/session/:sessionId', authenticateToken, clearSession);

export default router;
