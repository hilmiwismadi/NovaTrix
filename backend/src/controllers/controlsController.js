// Controls Controller
// CRUD operations for Annex A controls

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/controls
 * Get all Annex A controls
 */
export const getControls = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) {
      where.category = category;
    }

    const controls = await prisma.annexAControl.findMany({
      where,
      orderBy: {
        id: 'asc'
      }
    });

    res.json({
      controls,
      total: controls.length
    });

  } catch (error) {
    console.error('Get controls error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch controls'
    });
  }
};

/**
 * GET /api/controls/:id
 * Get single control by ID
 */
export const getControlById = async (req, res) => {
  try {
    const { id } = req.params;

    const control = await prisma.annexAControl.findUnique({
      where: { id: parseInt(id) },
      include: {
        annotationControls: {
          include: {
            annotation: {
              include: {
                document: true
              }
            }
          }
        }
      }
    });

    if (!control) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Control not found'
      });
    }

    res.json({ control });

  } catch (error) {
    console.error('Get control error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch control'
    });
  }
};
