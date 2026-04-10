// Documents Controller

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateSlug, generateUniqueSlug } from '../services/slugService.js';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..', '..');
const uploadsRoot = path.join(backendRoot, 'uploads', 'documents');

const toSystemPath = (inputPath = '') => inputPath.replace(/\//g, path.sep);

const resolveDocumentPath = (storedPath = '') => {
  const normalizedPath = toSystemPath(storedPath);

  // 1) Direct absolute/relative resolution
  const directPath = path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.join(backendRoot, normalizedPath);
  if (fs.existsSync(directPath)) return directPath;

  // 2) Legacy absolute paths from previous workspace location
  //    e.g. D:/.../skripsi/NovaTrix/backend/uploads/documents/file.pdf
  const filename = path.basename(normalizedPath);
  const fallbackByName = path.join(uploadsRoot, filename);
  if (filename && fs.existsSync(fallbackByName)) return fallbackByName;

  return directPath;
};

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
    const absoluteFilePath = req.file.path;
    const filePath = path.relative(backendRoot, absoluteFilePath).replace(/\\/g, '/');
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
    const resolvedPath = resolveDocumentPath(document.filePath);
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
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

    const resolvedPath = resolveDocumentPath(document.filePath);

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        error: 'Not found',
        message: 'PDF file not found on server'
      });
    }

    // Set headers for PDF.js
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.title}.pdf"`);

    // Stream file
    const fileStream = fs.createReadStream(resolvedPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Serve PDF error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to serve PDF'
    });
  }
};

/**
 * GET /api/documents/stats
 * Get document statistics for dashboard
 */
export const getDocumentStats = async (req, res) => {
  try {
    // Calculate date 7 days ago for "this week" trend
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get total count
    const total = await prisma.document.count();

    // Get count for this week
    const thisWeek = await prisma.document.count({
      where: {
        uploadDate: {
          gte: oneWeekAgo
        }
      }
    });

    // Get counts by status
    const statusCounts = await prisma.document.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Format status counts
    const byStatus = {
      raw: 0,
      analyzed: 0,
      verified: 0
    };

    statusCounts.forEach(item => {
      if (item.status === 'raw') byStatus.raw = item._count.status;
      if (item.status === 'analyzed') byStatus.analyzed = item._count.status;
      if (item.status === 'verified') byStatus.verified = item._count.status;
    });

    res.json({
      total,
      thisWeek,
      byStatus
    });

  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch document statistics'
    });
  }
};
