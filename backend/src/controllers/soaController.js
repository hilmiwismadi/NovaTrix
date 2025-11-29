/**
 * SOA (Statement of Applicability) Controller
 * Manages CRUD operations for SOA entries
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/soa
 * Get all SOA entries with control details and evidence summary
 */
export const getAllSOAEntries = async (req, res) => {
  try {
    const entries = await prisma.sOAEntry.findMany({
      include: {
        control: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true
          }
        }
      },
      orderBy: {
        controlId: 'asc'
      }
    });

    // For each entry, aggregate evidence summary
    const entriesWithEvidence = await Promise.all(
      entries.map(async (entry) => {
        // Get annotation evidence
        const annotationControls = await prisma.annotationControl.findMany({
          where: { controlId: entry.controlId },
          include: {
            annotation: {
              select: {
                id: true,
                highlightedText: true,
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
        });

        // Get interview evidence
        const interviewQAControls = await prisma.interviewQAControl.findMany({
          where: { controlId: entry.controlId },
          include: {
            qa: {
              select: {
                id: true,
                questionText: true,
                answerText: true,
                interview: {
                  select: {
                    id: true,
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
        });

        // Extract unique documents
        const documents = [...new Set(
          annotationControls
            .map(ac => ac.annotation.document)
            .filter(Boolean)
        )];

        // Extract unique annotations
        const annotations = annotationControls.map(ac => ({
          id: ac.annotation.id,
          highlightedText: ac.annotation.highlightedText
        }));

        // Extract unique interviews
        const interviews = [...new Set(
          interviewQAControls
            .map(iqac => iqac.qa.interview.respondent)
            .filter(Boolean)
        )];

        return {
          ...entry,
          evidenceSummary: {
            documents,
            annotations,
            interviews
          }
        };
      })
    );

    res.json({
      entries: entriesWithEvidence,
      total: entriesWithEvidence.length
    });

  } catch (error) {
    console.error('Get all SOA entries error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch SOA entries'
    });
  }
};

/**
 * PUT /api/soa/:id
 * Update SOA entry fields
 */
export const updateSOAEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      applicability,
      justification,
      implementationStatus,
      implementationMethod
    } = req.body;

    // Validate applicability value
    const validApplicability = ['applicable', 'not-applicable', 'not-determined'];
    if (applicability && !validApplicability.includes(applicability)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Applicability must be one of: ${validApplicability.join(', ')}`
      });
    }

    // Validate implementation status
    const validStatus = ['implemented', 'partially-implemented', 'not-implemented', 'planned'];
    if (implementationStatus && !validStatus.includes(implementationStatus)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Implementation status must be one of: ${validStatus.join(', ')}`
      });
    }

    // Validate justification requirement
    if ((applicability === 'applicable' || applicability === 'not-applicable') &&
        justification !== undefined &&
        justification !== null &&
        justification.trim().length < 10) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Justification must be at least 10 characters when applicability is Yes or No'
      });
    }

    // Check if entry exists
    const existingEntry = await prisma.sOAEntry.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingEntry) {
      return res.status(404).json({
        error: 'Not found',
        message: 'SOA entry not found'
      });
    }

    // Update entry
    const updatedEntry = await prisma.sOAEntry.update({
      where: { id: parseInt(id) },
      data: {
        ...(applicability !== undefined && { applicability }),
        ...(justification !== undefined && { justification }),
        ...(implementationStatus !== undefined && { implementationStatus }),
        ...(implementationMethod !== undefined && { implementationMethod })
      },
      include: {
        control: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    res.json({
      entry: updatedEntry,
      message: 'SOA entry updated successfully'
    });

  } catch (error) {
    console.error('Update SOA entry error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update SOA entry'
    });
  }
};

/**
 * GET /api/soa/evidence/:controlId
 * Get detailed evidence for a specific control
 */
export const getControlEvidence = async (req, res) => {
  try {
    const { controlId } = req.params;

    // Check if control exists
    const control = await prisma.annexAControl.findUnique({
      where: { id: controlId }
    });

    if (!control) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Control not found'
      });
    }

    // Get annotation evidence with document details
    const annotationControls = await prisma.annotationControl.findMany({
      where: { controlId },
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
    });

    // Group annotations by document
    const documentsMap = new Map();
    annotationControls.forEach(ac => {
      const doc = ac.annotation.document;
      if (!doc) return;

      if (!documentsMap.has(doc.id)) {
        documentsMap.set(doc.id, {
          id: doc.id,
          title: doc.title,
          slug: doc.slug,
          annotations: []
        });
      }

      // Parse position data
      let positionData = {};
      try {
        positionData = JSON.parse(ac.annotation.positionData);
      } catch (e) {
        console.error('Failed to parse position data:', e);
      }

      documentsMap.get(doc.id).annotations.push({
        id: ac.annotation.id,
        highlightedText: ac.annotation.highlightedText,
        annotationText: ac.annotation.annotationText,
        position: ac.annotation.positionData, // Include full position data for scrolling
        pageNumber: positionData.pageNumber || null,
        color: ac.annotation.color
      });
    });

    // Get interview evidence with respondent details
    const interviewQAControls = await prisma.interviewQAControl.findMany({
      where: { controlId },
      include: {
        qa: {
          include: {
            interview: {
              include: {
                respondent: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    division: true
                  }
                }
              }
            }
          }
        }
      }
    });

    // Group QA items by interview
    const interviewsMap = new Map();
    interviewQAControls.forEach(iqac => {
      const interview = iqac.qa.interview;
      if (!interview) return;

      if (!interviewsMap.has(interview.id)) {
        interviewsMap.set(interview.id, {
          interviewId: interview.id,
          respondentName: interview.respondent.name,
          respondentRole: interview.respondent.role,
          respondentDivision: interview.respondent.division,
          interviewDate: interview.interviewDate,
          qaItems: []
        });
      }

      interviewsMap.get(interview.id).qaItems.push({
        id: iqac.qa.id,
        questionText: iqac.qa.questionText,
        answerText: iqac.qa.answerText
      });
    });

    res.json({
      controlId,
      documents: Array.from(documentsMap.values()),
      interviews: Array.from(interviewsMap.values())
    });

  } catch (error) {
    console.error('Get control evidence error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch control evidence'
    });
  }
};
