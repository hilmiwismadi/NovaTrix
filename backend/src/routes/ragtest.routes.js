import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { runRagTest, getRagTestRuns } from '../controllers/ragTestController.js';

const router = express.Router();

router.post('/', authenticateToken, runRagTest);
router.get('/data', authenticateToken, getRagTestRuns);

export default router;
