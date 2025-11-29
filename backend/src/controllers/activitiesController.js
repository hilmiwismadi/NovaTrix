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
    const limitNum = parseInt(limit);

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

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: mapActivityTypeToType(activity.activityType),
      action: mapActivityTypeToAction(activity.activityType),
      description: activity.description,
      detail: activity.metadata || extractDetailFromDescription(activity.description),
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
    'annotation_created': 'annotation',
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
    'annotation_created': 'created',
    'control_updated': 'updated',
    'gap_created': 'identified',
    'soa_updated': 'generated'
  };
  return mapping[activityType] || 'completed';
}

// Helper: Extract detail from description (fallback)
function extractDetailFromDescription(description) {
  return description.length > 50
    ? description.substring(0, 50) + '...'
    : description;
}
