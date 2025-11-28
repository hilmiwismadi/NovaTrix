// Mock Activities Data

export const activities = [
  {
    id: 'act-001',
    type: 'document',
    action: 'uploaded',
    description: 'UGM Information Security Policy 2024',
    detail: 'New policy document uploaded for analysis',
    timestamp: '2024-11-27T10:30:00',
    user: 'Admin'
  },
  {
    id: 'act-002',
    type: 'document',
    action: 'analyzed',
    description: 'Cloud Services Security Guidelines',
    detail: 'AI analysis completed - Status: Raw',
    timestamp: '2024-11-27T09:15:00',
    user: 'AI System'
  },
  {
    id: 'act-003',
    type: 'interview',
    action: 'added',
    description: 'Interview with Dr. Ahmad Susanto',
    detail: 'New interview added - Maturity Score: 4/5',
    timestamp: '2024-11-26T14:20:00',
    user: 'Admin'
  },
  {
    id: 'act-004',
    type: 'analysis',
    action: 'completed',
    description: 'Gap analysis for Annex A controls',
    detail: '10 high-priority gaps identified',
    timestamp: '2024-11-26T11:45:00',
    user: 'AI System'
  },
  {
    id: 'act-005',
    type: 'document',
    action: 'verified',
    description: 'Incident Response and Business Continuity Procedures',
    detail: 'Document review completed and verified',
    timestamp: '2024-11-25T16:30:00',
    user: 'Admin'
  },
  {
    id: 'act-006',
    type: 'interview',
    action: 'analyzed',
    description: 'Interview with Ibu Siti Rahayu',
    detail: 'AI analysis completed - Maturity Score: 3/5',
    timestamp: '2024-11-25T13:10:00',
    user: 'AI System'
  },
  {
    id: 'act-007',
    type: 'soa',
    action: 'generated',
    description: 'Statement of Applicability updated',
    detail: '28 controls assessed across 4 categories',
    timestamp: '2024-11-24T15:45:00',
    user: 'AI System'
  },
  {
    id: 'act-008',
    type: 'document',
    action: 'uploaded',
    description: 'Remote Working and BYOD Policy',
    detail: 'New policy document uploaded for analysis',
    timestamp: '2024-11-24T10:20:00',
    user: 'Admin'
  },
  {
    id: 'act-009',
    type: 'interview',
    action: 'added',
    description: 'Interview with Pak Budi Santoso',
    detail: 'New interview added - Maturity Score: 2/5',
    timestamp: '2024-11-23T11:30:00',
    user: 'Admin'
  },
  {
    id: 'act-010',
    type: 'document',
    action: 'analyzed',
    description: 'Data Classification and Handling Guidelines',
    detail: 'AI analysis completed - 4 gaps identified',
    timestamp: '2024-11-23T09:00:00',
    user: 'AI System'
  },
  {
    id: 'act-011',
    type: 'control',
    action: 'updated',
    description: 'Control A.5.1 compliance rating updated',
    detail: 'Rating increased from 80% to 85%',
    timestamp: '2024-11-22T14:15:00',
    user: 'AI System'
  },
  {
    id: 'act-012',
    type: 'document',
    action: 'verified',
    description: 'Employee Security Awareness Training Program',
    detail: 'Document review completed and verified',
    timestamp: '2024-11-22T10:45:00',
    user: 'Admin'
  },
  {
    id: 'act-013',
    type: 'interview',
    action: 'added',
    description: 'Interview with Dr. Wulan Pertiwi',
    detail: 'New interview added - Maturity Score: 2/5',
    timestamp: '2024-11-21T15:20:00',
    user: 'Admin'
  },
  {
    id: 'act-014',
    type: 'document',
    action: 'analyzed',
    description: 'IT Security Roles and Responsibilities - DTI',
    detail: 'AI analysis completed - 4 gaps identified',
    timestamp: '2024-11-21T11:30:00',
    user: 'AI System'
  },
  {
    id: 'act-015',
    type: 'analysis',
    action: 'completed',
    description: 'Compliance overview updated',
    detail: 'Overall compliance score: 58%',
    timestamp: '2024-11-20T16:00:00',
    user: 'AI System'
  },
  {
    id: 'act-016',
    type: 'document',
    action: 'uploaded',
    description: 'UGM Information Security Policy 2024',
    detail: 'Policy document uploaded for review',
    timestamp: '2024-11-20T09:30:00',
    user: 'Admin'
  },
  {
    id: 'act-017',
    type: 'soa',
    action: 'exported',
    description: 'SOA exported to PDF',
    detail: 'Statement of Applicability report generated',
    timestamp: '2024-11-19T14:45:00',
    user: 'Admin'
  },
  {
    id: 'act-018',
    type: 'control',
    action: 'reviewed',
    description: 'A.6 People Controls category reviewed',
    detail: '8 controls assessed - 3 partial, 1 non-compliant',
    timestamp: '2024-11-19T10:15:00',
    user: 'Admin'
  },
  {
    id: 'act-019',
    type: 'gap',
    action: 'prioritized',
    description: 'Gap analysis priorities updated',
    detail: '5 high, 4 medium, 1 low priority gaps',
    timestamp: '2024-11-18T15:30:00',
    user: 'AI System'
  },
  {
    id: 'act-020',
    type: 'system',
    action: 'initialized',
    description: 'NovaTrix system initialized',
    detail: 'Compliance management system ready',
    timestamp: '2024-11-18T09:00:00',
    user: 'System'
  }
];

export const getRecentActivities = (limit = 10) => {
  return activities.slice(0, limit);
};

export const getActivitiesByType = (type) => {
  return activities.filter(activity => activity.type === type);
};

export const getActivitiesByUser = (user) => {
  return activities.filter(activity => activity.user === user);
};
