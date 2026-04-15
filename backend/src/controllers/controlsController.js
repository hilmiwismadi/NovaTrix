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
    if (category && category !== 'ALL') {
      where.category = category;
    }

    const controls = await prisma.annexAControl.findMany({
      where,
      orderBy: {
        id: 'asc'
      },
      include: {
        suggestedActions: {
          orderBy: {
            priority: 'desc'
          }
        },
        _count: {
          select: {
            annotationControls: true,
            interviewQAControls: true
          }
        }
      }
    });

    // Transform to include counts as separate fields
    const transformedControls = controls.map(control => ({
      ...control,
      relatedDocsCount: control._count.annotationControls,
      relatedInterviewsCount: control._count.interviewQAControls
    }));

    res.json({
      controls: transformedControls,
      total: transformedControls.length
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
      where: { id },
      include: {
        suggestedActions: {
          orderBy: {
            priority: 'desc'
          }
        },
        annotationControls: {
          include: {
            annotation: {
              include: {
                document: {
                  select: {
                    id: true,
                    title: true,
                    slug: true
                  }
                }
              }
            }
          }
        },
        interviewQAControls: {
          include: {
            qa: {
              include: {
                interview: {
                  include: {
                    respondent: {
                      select: {
                        id: true,
                        name: true,
                        role: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            annotationControls: true,
            interviewQAControls: true
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

    // Extract unique documents and interviews
    const relatedDocs = [...new Set(
      control.annotationControls.map(ac => ac.annotation.document)
    )].filter(Boolean);

    const relatedInterviews = [...new Set(
      control.interviewQAControls.map(iqac => iqac.qa.interview.respondent)
    )].filter(Boolean);

    res.json({
      control: {
        ...control,
        relatedDocs,
        relatedInterviews,
        relatedDocsCount: control._count.annotationControls,
        relatedInterviewsCount: control._count.interviewQAControls
      }
    });

  } catch (error) {
    console.error('Get control error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch control'
    });
  }
};

/**
 * GET /api/controls/stats
 * Get control statistics for dashboard
 */
export const getControlStats = async (req, res) => {
  try {
    const controls = await prisma.annexAControl.findMany({
      select: {
        status: true,
        rating: true
      }
    });
    const soaEntries = await prisma.sOAEntry.findMany({
      select: {
        applicability: true
      }
    });

    const total = controls.length;

    // Count by status
    const compliant = controls.filter(c => c.status === 'compliant').length;
    const partial = controls.filter(c => c.status === 'partial').length;
    const nonCompliant = controls.filter(c => c.status === 'non-compliant').length;
    const pending = controls.filter(c => c.status === 'pending').length;

    // Calculate average compliance score
    const averageScore = controls.length > 0
      ? Math.round(controls.reduce((sum, c) => sum + c.rating, 0) / controls.length)
      : 0;
    const analyzedControls = soaEntries.filter((entry) => entry.applicability !== 'not-determined').length;

    res.json({
      total,
      compliant,
      partial,
      nonCompliant,
      pending,
      averageScore,
      analyzedControls
    });

  } catch (error) {
    console.error('Get control stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch control statistics'
    });
  }
};
