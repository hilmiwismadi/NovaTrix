// Documents Controller

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { generateSlug, generateUniqueSlug } from '../services/slugService.js';

const prisma = new PrismaClient();

/**
 * GET /api/documents
 * Get all documents
 */
export const getDocuments = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { summaryShort: { contains: search } }
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            annotations: true
          }
        }
      },
      orderBy: {
        uploadDate: 'desc'
      }
    });

    res.json({
      documents,
      total: documents.length
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch documents'
    });
  }
};

/**
 * GET /api/documents/:slug
 * Get single document by slug
 */
export const getDocumentBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const document = await prisma.document.findUnique({
      where: { slug },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        annotations: {
          include: {
            annotationControls: {
              include: {
                control: true
              }
            }
          }
        }
      }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Document not found'
      });
    }

    res.json({ document });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch document'
    });
  }
};

/**
 * POST /api/documents
 * Upload new document
 */
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No file uploaded'
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Document title is required'
      });
    }

    // Generate slug
    const baseSlug = generateSlug(title);
    const slug = await generateUniqueSlug(baseSlug, async (checkSlug) => {
      const existing = await prisma.document.findUnique({
        where: { slug: checkSlug }
      });
      return !!existing;
    });

    // Get file info
    const filePath = req.file.path.replace(/\\/g, '/'); // Normalize path
    const fileSize = (req.file.size / (1024 * 1024)).toFixed(2) + ' MB';

    // Create document
    const document = await prisma.document.create({
      data: {
        title,
        slug,
        filePath,
        fileType: 'PDF',
        fileSize,
        status: 'raw',
        uploadedById: req.user.id
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        activityType: 'document_uploaded',
        entityType: 'documents',
        entityId: document.id,
        description: `Uploaded document: ${title}`
      }
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to upload document'
    });
  }
};

/**
 * PUT /api/documents/:slug
 * Update document metadata
 */
export const updateDocument = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, summaryShort, summaryDetailed, summaryIsoCompliance, status } = req.body;

    const document = await prisma.document.findUnique({
      where: { slug }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Document not found'
      });
    }

    const updateData = {};

    if (title) updateData.title = title;
    if (summaryShort) updateData.summaryShort = summaryShort;
    if (summaryDetailed) updateData.summaryDetailed = summaryDetailed;
    if (summaryIsoCompliance) updateData.summaryIsoCompliance = summaryIsoCompliance;
    if (status) updateData.status = status;

    const updatedDocument = await prisma.document.update({
      where: { slug },
      data: updateData,
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update document'
    });
  }
};

/**
 * DELETE /api/documents/:slug
 * Delete document
 */
export const deleteDocument = async (req, res) => {
  try {
    const { slug } = req.params;

    const document = await prisma.document.findUnique({
      where: { slug }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Delete from database (cascade will delete annotations)
    await prisma.document.delete({
      where: { slug }
    });

    res.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete document'
    });
  }
};

/**
 * GET /api/documents/:slug/pdf
 * Serve PDF file
 * Supports token via query parameter for PDF.js viewer
 */
export const servePDF = async (req, res) => {
  try {
    const { slug } = req.params;
    const { token } = req.query;

    // Verify token (from query param or Authorization header)
    const authToken = token || req.headers.authorization?.split(' ')[1];

    if (!authToken) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    // Verify token
    const jwt = await import('jsonwebtoken');
    try {
      jwt.default.verify(authToken, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    const document = await prisma.document.findUnique({
      where: { slug }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Document not found'
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        error: 'Not found',
        message: 'PDF file not found on server'
      });
    }

    // Set CORS headers for PDF.js
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5174');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.title}.pdf"`);

    // Stream file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Serve PDF error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to serve PDF'
    });
  }
};
