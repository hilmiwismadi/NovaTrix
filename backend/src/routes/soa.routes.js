/**
 * SOA (Statement of Applicability) Routes
 */

import express from 'express';
import {
  getAllSOAEntries,
  updateSOAEntry,
  getControlEvidence,
  syncSOAFromAnnotation
} from '../controllers/soaController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/soa - Get all SOA entries with evidence summary
router.get('/', getAllSOAEntries);

// PUT /api/soa/:id - Update SOA entry
router.put('/:id', updateSOAEntry);

// POST /api/soa/sync-from-annotation - Sync SOA fields from annotation AI output
router.post('/sync-from-annotation', syncSOAFromAnnotation);

// GET /api/soa/evidence/:controlId - Get detailed evidence for control
router.get('/evidence/:controlId', getControlEvidence);

export default router;
