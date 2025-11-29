// Activities Controller
// Handles activity log and recent activities

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/activities/recent
 * Get recent activities
 */
export const getRecentActivities = async (req, res) => {
  try {
    const { limit = 15 } = req.query;
    const limitNum = parseInt(limit) * 3; // Fetch more to account for consolidation

    const activities = await prisma.activity.findMany({
      take: limitNum,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            fullName: true
          }
        }
      }
    });

    // Consolidate annotation activities
    const consolidatedActivities = consolidateAnnotationActivities(activities);

    // Format activities for frontend
    const formattedActivities = consolidatedActivities.slice(0, parseInt(limit)).map(activity => ({
      id: activity.id,
      type: mapActivityTypeToType(activity.activityType),
      action: mapActivityTypeToAction(activity.activityType),
      description: activity.description,
      detail: activity.detail || extractDetailFromDescription(activity.description),
      timestamp: activity.createdAt,
      user: activity.user?.fullName || 'System'
    }));

    res.json({
      activities: formattedActivities
    });

  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch recent activities'
    });
  }
};

// Helper: Map activityType to display type
function mapActivityTypeToType(activityType) {
  const mapping = {
    'document_uploaded': 'document',
    'document_analyzed': 'document',
    'document_verified': 'document',
    'interview_created': 'interview',
    'interview_updated': 'interview',
    'interview_deleted': 'interview',
    'annotation_created': 'document',
    'annotation_tagged': 'document',
    'control_updated': 'control',
    'gap_created': 'gap',
    'soa_updated': 'soa'
  };
  return mapping[activityType] || 'system';
}

// Helper: Map activityType to action verb
function mapActivityTypeToAction(activityType) {
  const mapping = {
    'document_uploaded': 'uploaded',
    'document_analyzed': 'analyzed',
    'document_verified': 'verified',
    'interview_created': 'added',
    'interview_updated': 'updated',
    'interview_deleted': 'deleted',
    'annotation_created': 'added',
    'annotation_tagged': 'tagged',
    'control_updated': 'updated',
    'gap_created': 'identified',
    'soa_updated': 'generated'
  };
  return mapping[activityType] || 'completed';
}

// Helper: Consolidate annotation activities
function consolidateAnnotationActivities(activities) {
  const TIME_WINDOW = 2 * 60 * 1000; // 2 minutes in milliseconds
  const consolidated = [];
  const processed = new Set();

  for (let i = 0; i < activities.length; i++) {
    if (processed.has(activities[i].id)) continue;

    const current = activities[i];

    // Only consolidate annotation activities
    if (!['annotation_created', 'annotation_tagged'].includes(current.activityType)) {
      consolidated.push(current);
      processed.add(current.id);
      continue;
    }

    const currentMetadata = current.metadata ? JSON.parse(current.metadata) : {};
    const relatedActivities = [current];
    processed.add(current.id);

    // Find related annotation activities for the same document within time window
    for (let j = i + 1; j < activities.length; j++) {
      if (processed.has(activities[j].id)) continue;

      const other = activities[j];
      if (!['annotation_created', 'annotation_tagged'].includes(other.activityType)) continue;

      const otherMetadata = other.metadata ? JSON.parse(other.metadata) : {};
      const timeDiff = Math.abs(new Date(current.createdAt) - new Date(other.createdAt));

      // Check if same document and within time window
      if (currentMetadata.documentId === otherMetadata.documentId &&
          timeDiff <= TIME_WINDOW &&
          current.userId === other.userId) {
        relatedActivities.push(other);
        processed.add(other.id);
      }
    }

    // Consolidate if multiple activities found
    if (relatedActivities.length > 1) {
      const allControls = new Set();
      const pages = new Set();

      relatedActivities.forEach(act => {
        const meta = act.metadata ? JSON.parse(act.metadata) : {};
        if (meta.controlIds && Array.isArray(meta.controlIds)) {
          meta.controlIds.forEach(c => allControls.add(c));
        }
        if (meta.controlId) {
          allControls.add(meta.controlId);
        }
        if (meta.pageNumber) {
          pages.add(meta.pageNumber);
        }
      });

      const controlsList = Array.from(allControls);
      const pagesList = Array.from(pages).sort((a, b) => a - b);

      let description;
      if (controlsList.length > 0) {
        const controlsText = controlsList.length > 3
          ? `${controlsList.slice(0, 3).join(', ')} and ${controlsList.length - 3} more`
          : controlsList.join(', ');
        description = `Added annotation to ${currentMetadata.documentTitle} with controls ${controlsText}`;
      } else {
        description = `Added annotation to ${currentMetadata.documentTitle}`;
      }

      const detail = pagesList.length > 0
        ? `Page ${pagesList.length === 1 ? pagesList[0] : pagesList.join(', ')}`
        : '';

      consolidated.push({
        ...current,
        description,
        detail
      });
    } else {
      // Single activity - format nicely
      let detail = '';
      if (currentMetadata.pageNumber) {
        detail = `Page ${currentMetadata.pageNumber}`;
      }
      consolidated.push({
        ...current,
        detail
      });
    }
  }

  return consolidated;
}

// Helper: Extract detail from description (fallback)
function extractDetailFromDescription(description) {
  return description.length > 50
    ? description.substring(0, 50) + '...'
    : description;
}
