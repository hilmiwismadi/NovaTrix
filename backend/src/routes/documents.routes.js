// Documents Routes

import express from 'express';
import {
  getDocuments,
  getDocumentBySlug,
  uploadDocument,
  updateDocument,
  deleteDocument,
  servePDF
} from '../controllers/documentsController.js';
import { authenticateToken } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   GET /api/documents
 * @desc    Get all documents
 * @access  Private
 */
router.get('/', authenticateToken, getDocuments);

/**
 * @route   GET /api/documents/:slug
 * @desc    Get document by slug
 * @access  Private
 */
router.get('/:slug', authenticateToken, getDocumentBySlug);

/**
 * @route   POST /api/documents
 * @desc    Upload new document
 * @access  Private
 */
router.post('/', authenticateToken, upload.single('file'), uploadDocument);

/**
 * @route   PUT /api/documents/:slug
 * @desc    Update document metadata
 * @access  Private
 */
router.put('/:slug', authenticateToken, updateDocument);

/**
 * @route   DELETE /api/documents/:slug
 * @desc    Delete document
 * @access  Private
 */
router.delete('/:slug', authenticateToken, deleteDocument);

/**
 * @route   GET /api/documents/:slug/pdf
 * @desc    Serve PDF file (handles auth via query token for PDF.js)
 * @access  Private
 */
router.get('/:slug/pdf', servePDF);

export default router;
