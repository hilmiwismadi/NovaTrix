// Annotations Routes

import express from 'express';
import {
  getAnnotationsByDocument,
  createAnnotation,
  updateAnnotation,
  deleteAnnotation,
  addControlToAnnotation,
  removeControlFromAnnotation
} from '../controllers/annotationsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/annotations/document/:documentId
 * @desc    Get all annotations for a document
 * @access  Private
 */
router.get('/document/:documentId', authenticateToken, getAnnotationsByDocument);

/**
 * @route   POST /api/annotations
 * @desc    Create new annotation
 * @access  Private
 */
router.post('/', authenticateToken, createAnnotation);

/**
 * @route   PUT /api/annotations/:id
 * @desc    Update annotation
 * @access  Private
 */
router.put('/:id', authenticateToken, updateAnnotation);

/**
 * @route   DELETE /api/annotations/:id
 * @desc    Delete annotation
 * @access  Private
 */
router.delete('/:id', authenticateToken, deleteAnnotation);

/**
 * @route   POST /api/annotations/:id/controls
 * @desc    Add control to annotation
 * @access  Private
 */
router.post('/:id/controls', authenticateToken, addControlToAnnotation);

/**
 * @route   DELETE /api/annotations/:id/controls/:controlId
 * @desc    Remove control from annotation
 * @access  Private
 */
router.delete('/:id/controls/:controlId', authenticateToken, removeControlFromAnnotation);

export default router;
