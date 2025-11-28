// ISO 27001:2022 Annex A Controls - Focused on Organizational & People Controls

export const CATEGORIES = {
  ORGANIZATIONAL: 'A.5 - Organizational Controls',
  PEOPLE: 'A.6 - People Controls',
  PHYSICAL: 'A.7 - Physical Controls',
  TECHNOLOGICAL: 'A.8 - Technological Controls'
};

export const annexAControls = [
  // A.5 - ORGANIZATIONAL CONTROLS (Primary Focus)
  {
    id: 'A.5.1',
    category: 'ORGANIZATIONAL',
    title: 'Policies for information security',
    description: 'Information security policy and topic-specific policies should be defined, approved, published, communicated and acknowledged by relevant personnel and interested parties.',
    status: 'compliant',
    rating: 85,
    relatedDocs: ['doc-001', 'doc-006'],
    relatedInterviews: ['int-001'],
    explanation: 'Well-documented security policies exist and are regularly reviewed. Policies are communicated through multiple channels including orientation and internal wiki.',
    suggestedActions: [
      'Update policy review schedule to quarterly instead of annually',
      'Add cloud security policy appendix',
      'Implement policy acknowledgment tracking system'
    ]
  },
  {
    id: 'A.5.2',
    category: 'ORGANIZATIONAL',
    title: 'Information security roles and responsibilities',
    description: 'Information security roles and responsibilities should be defined and allocated according to the organization needs.',
    status: 'partial',
    rating: 60,
    relatedDocs: ['doc-002'],
    relatedInterviews: ['int-001', 'int-002'],
    explanation: 'Roles are documented but responsibilities lack clarity. Overlapping duties between security team and department liaisons cause confusion.',
    suggestedActions: [
      'Create detailed RACI matrix for all security responsibilities',
      'Define escalation procedures clearly',
      'Clarify overlap between central IT security and departmental roles'
    ]
  },
  {
    id: 'A.5.3',
    category: 'ORGANIZATIONAL',
    title: 'Segregation of duties',
    description: 'Conflicting duties and conflicting areas of responsibility should be segregated.',
    status: 'partial',
    rating: 55,
    relatedDocs: ['doc-002'],
    relatedInterviews: ['int-003'],
    explanation: 'Basic segregation exists but not formally documented. System administrators have excessive combined privileges.',
    suggestedActions: [
      'Implement formal segregation of duties matrix',
      'Separate development and production access',
      'Review administrator privilege assignments'
    ]
  },
  {
    id: 'A.5.7',
    category: 'ORGANIZATIONAL',
    title: 'Threat intelligence',
    description: 'Information relating to information security threats should be collected and analyzed to produce threat intelligence.',
    status: 'non-compliant',
    rating: 30,
    relatedDocs: [],
    relatedInterviews: ['int-002'],
    explanation: 'No formal threat intelligence gathering or analysis process. Security team relies on ad-hoc information sources.',
    suggestedActions: [
      'Subscribe to relevant threat intelligence feeds',
      'Establish process for reviewing and acting on threat data',
      'Assign responsibility for threat monitoring'
    ]
  },
  {
    id: 'A.5.8',
    category: 'ORGANIZATIONAL',
    title: 'Information security in project management',
    description: 'Information security should be integrated in project management.',
    status: 'partial',
    rating: 50,
    relatedDocs: ['doc-006'],
    relatedInterviews: [],
    explanation: 'Security considerations are included in major IT projects but not systematically applied across all projects.',
    suggestedActions: [
      'Create security requirements checklist for all projects',
      'Include security review in project approval process',
      'Train project managers on security integration'
    ]
  },
  {
    id: 'A.5.9',
    category: 'ORGANIZATIONAL',
    title: 'Inventory of information and other associated assets',
    description: 'An inventory of information and other associated assets, including owners, should be developed and maintained.',
    status: 'partial',
    rating: 65,
    relatedDocs: ['doc-005'],
    relatedInterviews: ['int-003'],
    explanation: 'Hardware inventory exists but information assets are not comprehensively catalogued. Asset ownership not clearly defined.',
    suggestedActions: [
      'Expand inventory to include information assets and data',
      'Assign and document asset owners',
      'Implement asset management system'
    ]
  },
  {
    id: 'A.5.10',
    category: 'ORGANIZATIONAL',
    title: 'Acceptable use of information and other associated assets',
    description: 'Rules for the acceptable use of information and other associated assets should be identified, documented and implemented.',
    status: 'compliant',
    rating: 75,
    relatedDocs: ['doc-001', 'doc-004'],
    relatedInterviews: ['int-001'],
    explanation: 'Acceptable use policy documented and communicated to all staff. Included in employment agreements.',
    suggestedActions: [
      'Add specific guidelines for social media use',
      'Update policy for remote work scenarios',
      'Implement periodic acknowledgment requirement'
    ]
  },
  {
    id: 'A.5.13',
    category: 'ORGANIZATIONAL',
    title: 'Labelling of information',
    description: 'An appropriate set of procedures for information labelling should be developed and implemented.',
    status: 'non-compliant',
    rating: 25,
    relatedDocs: ['doc-005'],
    relatedInterviews: [],
    explanation: 'Data classification scheme exists in policy but labelling is not implemented in practice.',
    suggestedActions: [
      'Implement document classification system',
      'Train staff on information labelling requirements',
      'Add classification fields to document templates'
    ]
  },
  {
    id: 'A.5.14',
    category: 'ORGANIZATIONAL',
    title: 'Information transfer',
    description: 'Information transfer rules, procedures, or agreements should be in place for all types of transfer facilities.',
    status: 'partial',
    rating: 58,
    relatedDocs: ['doc-001'],
    relatedInterviews: ['int-003'],
    explanation: 'Email security guidelines exist but file transfer procedures are incomplete. No formal agreements for external transfers.',
    suggestedActions: [
      'Document secure file transfer procedures',
      'Implement approved file sharing solution',
      'Create template agreements for data transfer with external parties'
    ]
  },
  {
    id: 'A.5.23',
    category: 'ORGANIZATIONAL',
    title: 'Information security for use of cloud services',
    description: 'Processes for acquisition, use, management and exit from cloud services should be established.',
    status: 'partial',
    rating: 45,
    relatedDocs: ['doc-007'],
    relatedInterviews: ['int-002'],
    explanation: 'Cloud services are used but governance is weak. No formal cloud security policy or vendor assessment process.',
    suggestedActions: [
      'Develop cloud security policy',
      'Implement cloud service vendor assessment procedure',
      'Document data residency and sovereignty requirements'
    ]
  },
  {
    id: 'A.5.29',
    category: 'ORGANIZATIONAL',
    title: 'Information security during disruption',
    description: 'The organization should plan how to maintain information security at an appropriate level during disruption.',
    status: 'partial',
    rating: 52,
    relatedDocs: ['doc-006'],
    relatedInterviews: [],
    explanation: 'Business continuity plan exists but information security aspects not fully addressed.',
    suggestedActions: [
      'Integrate security requirements into BCP',
      'Define security priorities during disruption',
      'Test security controls in disruption scenarios'
    ]
  },
  {
    id: 'A.5.30',
    category: 'ORGANIZATIONAL',
    title: 'ICT readiness for business continuity',
    description: 'ICT readiness should be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.',
    status: 'compliant',
    rating: 70,
    relatedDocs: ['doc-006'],
    relatedInterviews: ['int-003'],
    explanation: 'System backups and redundancy in place for critical systems. Regular backup testing performed.',
    suggestedActions: [
      'Expand disaster recovery testing to include security systems',
      'Document recovery time objectives for all critical systems',
      'Implement off-site backup verification'
    ]
  },

  // A.6 - PEOPLE CONTROLS (Primary Focus)
  {
    id: 'A.6.1',
    category: 'PEOPLE',
    title: 'Screening',
    description: 'Background verification checks on all candidates for employment should be carried out prior to joining the organization.',
    status: 'compliant',
    rating: 80,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-002'],
    explanation: 'HR conducts background checks for all new employees including reference verification and educational credential checks.',
    suggestedActions: [
      'Extend screening to contract workers and vendors',
      'Implement periodic re-screening for sensitive positions',
      'Add social media screening component'
    ]
  },
  {
    id: 'A.6.2',
    category: 'PEOPLE',
    title: 'Terms and conditions of employment',
    description: 'The employment contractual agreements should state the employee and the organization responsibilities for information security.',
    status: 'compliant',
    rating: 78,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-002'],
    explanation: 'Employment contracts include confidentiality clauses and reference to security policies. Employees sign acknowledgment.',
    suggestedActions: [
      'Update contract template with specific data protection obligations',
      'Add provisions for post-employment data access restrictions',
      'Clarify personal device usage terms'
    ]
  },
  {
    id: 'A.6.3',
    category: 'PEOPLE',
    title: 'Information security awareness, education and training',
    description: 'Personnel of the organization and relevant interested parties should receive appropriate information security awareness, education and training.',
    status: 'partial',
    rating: 62,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-001', 'int-002'],
    explanation: 'Security awareness training exists but lacks structured curriculum. No completion tracking or effectiveness measurement.',
    suggestedActions: [
      'Develop comprehensive security awareness program',
      'Implement learning management system for tracking',
      'Add phishing simulation exercises',
      'Make training mandatory with quarterly refreshers'
    ]
  },
  {
    id: 'A.6.4',
    category: 'PEOPLE',
    title: 'Disciplinary process',
    description: 'A disciplinary process should be formalized and communicated to take actions against personnel who have committed an information security breach.',
    status: 'partial',
    rating: 48,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-002'],
    explanation: 'General disciplinary process exists but specific procedures for security breaches not clearly defined.',
    suggestedActions: [
      'Define specific disciplinary actions for security violations',
      'Document security incident investigation procedures',
      'Clarify roles in security breach investigations'
    ]
  },
  {
    id: 'A.6.5',
    category: 'PEOPLE',
    title: 'Responsibilities after termination or change of employment',
    description: 'Information security responsibilities and duties that remain valid after termination or change of employment should be defined, enforced and communicated.',
    status: 'partial',
    rating: 55,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-002'],
    explanation: 'Exit procedures include IT access termination but post-employment confidentiality obligations not systematically communicated.',
    suggestedActions: [
      'Implement formal exit interview with security checklist',
      'Clarify ongoing confidentiality obligations',
      'Document asset return procedures'
    ]
  },
  {
    id: 'A.6.6',
    category: 'PEOPLE',
    title: 'Confidentiality or non-disclosure agreements',
    description: 'Confidentiality or non-disclosure agreements should reflect the organization needs for the protection of information.',
    status: 'compliant',
    rating: 75,
    relatedDocs: ['doc-003'],
    relatedInterviews: ['int-002'],
    explanation: 'NDAs in place for employees and vendors handling sensitive information.',
    suggestedActions: [
      'Review NDA template for comprehensiveness',
      'Extend NDA requirements to research collaborators',
      'Implement NDA tracking system'
    ]
  },
  {
    id: 'A.6.7',
    category: 'PEOPLE',
    title: 'Remote working',
    description: 'Security measures should be implemented when personnel are working remotely to protect information.',
    status: 'partial',
    rating: 58,
    relatedDocs: ['doc-004'],
    relatedInterviews: ['int-001', 'int-003'],
    explanation: 'Remote working policy exists with VPN requirements, but enforcement and monitoring are weak.',
    suggestedActions: [
      'Strengthen remote access security controls',
      'Implement endpoint security for remote devices',
      'Define secure home office requirements',
      'Provide security awareness for remote workers'
    ]
  },
  {
    id: 'A.6.8',
    category: 'PEOPLE',
    title: 'Information security event reporting',
    description: 'The organization should provide a mechanism for personnel to report observed or suspected information security events.',
    status: 'partial',
    rating: 50,
    relatedDocs: ['doc-006'],
    relatedInterviews: ['int-001'],
    explanation: 'Incident reporting mechanism exists through help desk but not well-publicized. Staff unsure when to report.',
    suggestedActions: [
      'Implement dedicated security incident reporting channel',
      'Train staff on what constitutes a reportable event',
      'Promote no-blame culture for reporting',
      'Provide feedback on reported incidents'
    ]
  },

  // A.7 - PHYSICAL CONTROLS (Light Coverage)
  {
    id: 'A.7.1',
    category: 'PHYSICAL',
    title: 'Physical security perimeters',
    description: 'Security perimeters should be defined and used to protect areas that contain information and other associated assets.',
    status: 'compliant',
    rating: 72,
    relatedDocs: [],
    relatedInterviews: ['int-003'],
    explanation: 'Server rooms have controlled access with locked doors. Building has security guard and visitor log.',
    suggestedActions: [
      'Install access control system for server room',
      'Implement visitor escort policy for secure areas'
    ]
  },
  {
    id: 'A.7.2',
    category: 'PHYSICAL',
    title: 'Physical entry',
    description: 'Secure areas should be protected by appropriate entry controls and access points.',
    status: 'partial',
    rating: 58,
    relatedDocs: [],
    relatedInterviews: ['int-003', 'int-004'],
    explanation: 'Basic access controls exist but no audit trail of entries. Keys shared among multiple staff members.',
    suggestedActions: [
      'Implement card-based access control system',
      'Enable access logging and audit trail',
      'Eliminate shared access credentials'
    ]
  },
  {
    id: 'A.7.4',
    category: 'PHYSICAL',
    title: 'Physical security monitoring',
    description: 'Premises should be continuously monitored for unauthorized physical access.',
    status: 'non-compliant',
    rating: 35,
    relatedDocs: [],
    relatedInterviews: ['int-003'],
    explanation: 'No CCTV or automated monitoring in server rooms. Security relies solely on locked doors.',
    suggestedActions: [
      'Install CCTV in server rooms with 30-day retention',
      'Implement intrusion detection system',
      'Establish 24/7 monitoring or alert system'
    ]
  },
  {
    id: 'A.7.7',
    category: 'PHYSICAL',
    title: 'Clear desk and clear screen',
    description: 'Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities should be defined and appropriately enforced.',
    status: 'partial',
    rating: 45,
    relatedDocs: ['doc-001'],
    relatedInterviews: ['int-001'],
    explanation: 'Clear desk policy exists but enforcement is inconsistent. Staff awareness is low.',
    suggestedActions: [
      'Increase awareness of clear desk policy',
      'Implement periodic compliance checks',
      'Provide secure storage for sensitive documents'
    ]
  },

  // A.8 - TECHNOLOGICAL CONTROLS (Light Coverage - No Pen Testing)
  {
    id: 'A.8.1',
    category: 'TECHNOLOGICAL',
    title: 'User endpoint devices',
    description: 'Information stored on, processed by or accessible via user endpoint devices should be protected.',
    status: 'partial',
    rating: 60,
    relatedDocs: ['doc-004'],
    relatedInterviews: ['int-003'],
    explanation: 'Antivirus deployed on university-owned devices. BYOD devices not managed or secured.',
    suggestedActions: [
      'Implement endpoint protection platform',
      'Extend security controls to BYOD devices',
      'Enable full disk encryption on laptops'
    ]
  },
  {
    id: 'A.8.2',
    category: 'TECHNOLOGICAL',
    title: 'Privileged access rights',
    description: 'The allocation and use of privileged access rights should be restricted and managed.',
    status: 'partial',
    rating: 52,
    relatedDocs: ['doc-002'],
    relatedInterviews: ['int-003'],
    explanation: 'Privileged accounts exist but no systematic review. Some administrators have excessive rights.',
    suggestedActions: [
      'Implement privileged access management system',
      'Conduct quarterly privileged access reviews',
      'Enforce multi-factor authentication for admin accounts'
    ]
  },
  {
    id: 'A.8.3',
    category: 'TECHNOLOGICAL',
    title: 'Information access restriction',
    description: 'Access to information and other associated assets should be restricted in accordance with the established topic-specific policy on access control.',
    status: 'partial',
    rating: 55,
    relatedDocs: ['doc-001', 'doc-005'],
    relatedInterviews: ['int-003'],
    explanation: 'Basic access controls implemented but not aligned with data classification. Access creep observed.',
    suggestedActions: [
      'Align access rights with data classification',
      'Implement role-based access control',
      'Conduct quarterly access rights reviews'
    ]
  },
  {
    id: 'A.8.5',
    category: 'TECHNOLOGICAL',
    title: 'Secure authentication',
    description: 'Secure authentication technologies and procedures should be implemented based on information access restrictions and the topic-specific policy on access control.',
    status: 'partial',
    rating: 48,
    relatedDocs: [],
    relatedInterviews: ['int-003'],
    explanation: 'Password-based authentication used but MFA not widely deployed. Weak password policies.',
    suggestedActions: [
      'Implement multi-factor authentication for all systems',
      'Strengthen password complexity requirements',
      'Deploy single sign-on solution'
    ]
  }
];

// Helper functions
export const getControlsByCategory = (category) => {
  return annexAControls.filter(control => control.category === category);
};

export const getControlById = (id) => {
  return annexAControls.find(control => control.id === id);
};

export const getComplianceStats = () => {
  const compliant = annexAControls.filter(c => c.status === 'compliant').length;
  const partial = annexAControls.filter(c => c.status === 'partial').length;
  const nonCompliant = annexAControls.filter(c => c.status === 'non-compliant').length;

  return { compliant, partial, nonCompliant, total: annexAControls.length };
};

export const getAverageComplianceScore = () => {
  const sum = annexAControls.reduce((acc, control) => acc + control.rating, 0);
  return Math.round(sum / annexAControls.length);
};
