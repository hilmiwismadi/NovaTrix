// Annotations Controller
// CRUD operations for PDF annotations and control linking

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/annotations/document/:documentId
 * Get all annotations for a document
 */
export const getAnnotationsByDocument = async (req, res) => {
  try {
    const { documentId } = req.params;

    const annotations = await prisma.annotation.findMany({
      where: {
        documentId: parseInt(documentId)
      },
      include: {
        annotationControls: {
          include: {
            control: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Map schema field names to frontend field names
    const mappedAnnotations = annotations.map(ann => ({
      ...ann,
      content: ann.highlightedText, // Map to frontend field name
      position: ann.positionData,   // Map to frontend field name
      pageNumber: JSON.parse(ann.positionData).pageNumber // Extract from position data
    }));

    res.json({
      annotations: mappedAnnotations,
      total: mappedAnnotations.length
    });

  } catch (error) {
    console.error('Get annotations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch annotations'
    });
  }
};

/**
 * POST /api/annotations
 * Create new annotation
 */
export const createAnnotation = async (req, res) => {
  try {
    const {
      documentId,
      content,
      position,
      color,
      pageNumber,
      controlIds = []
    } = req.body;

    // Validate required fields
    if (!documentId || !content || !position || pageNumber === undefined) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Missing required fields: documentId, content, position, pageNumber'
      });
    }

    // Verify document exists
    const document = await prisma.document.findUnique({
      where: { id: parseInt(documentId) }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Document not found'
      });
    }

    // Create annotation with control links
    // Map frontend field names to schema field names
    const annotation = await prisma.annotation.create({
      data: {
        documentId: parseInt(documentId),
        highlightedText: content, // Schema field name
        positionData: typeof position === 'string' ? position : JSON.stringify(position), // Schema field name
        color: color || '#FFFF00',
        annotationControls: {
          create: controlIds.map(controlId => ({
            controlId: parseInt(controlId)
          }))
        }
      },
      include: {
        annotationControls: {
          include: {
            control: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Annotation created successfully',
      annotation
    });

  } catch (error) {
    console.error('Create annotation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create annotation'
    });
  }
};

/**
 * PUT /api/annotations/:id
 * Update annotation
 */
export const updateAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      content,
      position,
      color,
      pageNumber,
      controlIds
    } = req.body;

    const annotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!annotation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Annotation not found'
      });
    }

    // Build update data
    const updateData = {};
    if (content !== undefined) updateData.content = content;
    if (position !== undefined) {
      updateData.position = typeof position === 'string' ? position : JSON.stringify(position);
    }
    if (color !== undefined) updateData.color = color;
    if (pageNumber !== undefined) updateData.pageNumber = parseInt(pageNumber);

    // If controlIds provided, update the links
    if (controlIds !== undefined) {
      // Delete existing links
      await prisma.annotationControl.deleteMany({
        where: { annotationId: parseInt(id) }
      });

      // Create new links
      updateData.annotationControls = {
        create: controlIds.map(controlId => ({
          controlId: parseInt(controlId)
        }))
      };
    }

    const updatedAnnotation = await prisma.annotation.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        annotationControls: {
          include: {
            control: true
          }
        }
      }
    });

    res.json({
      message: 'Annotation updated successfully',
      annotation: updatedAnnotation
    });

  } catch (error) {
    console.error('Update annotation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update annotation'
    });
  }
};

/**
 * DELETE /api/annotations/:id
 * Delete annotation
 */
export const deleteAnnotation = async (req, res) => {
  try {
    const { id } = req.params;

    const annotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!annotation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Annotation not found'
      });
    }

    // Delete annotation (cascade will delete annotation_controls)
    await prisma.annotation.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      message: 'Annotation deleted successfully'
    });

  } catch (error) {
    console.error('Delete annotation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete annotation'
    });
  }
};

/**
 * POST /api/annotations/:id/controls
 * Add control to annotation
 */
export const addControlToAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const { controlId } = req.body;

    if (!controlId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'controlId is required'
      });
    }

    // Check if annotation exists
    const annotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) }
    });

    if (!annotation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Annotation not found'
      });
    }

    // Check if control exists
    const control = await prisma.annexAControl.findUnique({
      where: { id: parseInt(controlId) }
    });

    if (!control) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Control not found'
      });
    }

    // Create link (will fail if already exists due to unique constraint)
    try {
      await prisma.annotationControl.create({
        data: {
          annotationId: parseInt(id),
          controlId: parseInt(controlId)
        }
      });

      // Fetch updated annotation
      const updatedAnnotation = await prisma.annotation.findUnique({
        where: { id: parseInt(id) },
        include: {
          annotationControls: {
            include: {
              control: true
            }
          }
        }
      });

      res.json({
        message: 'Control added to annotation successfully',
        annotation: updatedAnnotation
      });

    } catch (linkError) {
      if (linkError.code === 'P2002') {
        return res.status(400).json({
          error: 'Validation error',
          message: 'This control is already linked to this annotation'
        });
      }
      throw linkError;
    }

  } catch (error) {
    console.error('Add control to annotation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add control to annotation'
    });
  }
};

/**
 * DELETE /api/annotations/:id/controls/:controlId
 * Remove control from annotation
 */
export const removeControlFromAnnotation = async (req, res) => {
  try {
    const { id, controlId } = req.params;

    const link = await prisma.annotationControl.findFirst({
      where: {
        annotationId: parseInt(id),
        controlId: parseInt(controlId)
      }
    });

    if (!link) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Control link not found'
      });
    }

    await prisma.annotationControl.delete({
      where: {
        id: link.id
      }
    });

    // Fetch updated annotation
    const updatedAnnotation = await prisma.annotation.findUnique({
      where: { id: parseInt(id) },
      include: {
        annotationControls: {
          include: {
            control: true
          }
        }
      }
    });

    res.json({
      message: 'Control removed from annotation successfully',
      annotation: updatedAnnotation
    });

  } catch (error) {
    console.error('Remove control from annotation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to remove control from annotation'
    });
  }
};
