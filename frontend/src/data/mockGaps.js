// Mock Gap Analysis Data

export const gaps = [
  {
    id: 'gap-001',
    controlId: 'A.7.4',
    controlTitle: 'Physical Security Monitoring',
    priority: 'HIGH',
    problemSummary: 'No documented physical access monitoring system for server rooms. Current security relies solely on locked doors without any surveillance, logging, or alert capabilities.',
    evidence: {
      documents: [],
      interviews: ['int-003', 'int-004'],
      findings: 'Systems administrator confirmed absence of CCTV monitoring and access logging. Compliance officer noted budget constraints preventing implementation of card-based access system.'
    },
    aiRecommendation: 'Implement comprehensive physical security monitoring including: (1) Install CCTV cameras in server rooms with minimum 30-day retention, (2) Deploy card-based access control system with audit logging, (3) Establish real-time alerting for unauthorized access attempts, (4) Conduct quarterly access log reviews.',
    estimatedEffort: '3-6 months',
    estimatedCost: 'Medium (Rp 150-300 juta)',
    impact: 'High - Current lack of monitoring creates significant risk of undetected physical breaches and insider threats'
  },
  {
    id: 'gap-002',
    controlId: 'A.5.13',
    controlTitle: 'Information Labelling',
    priority: 'HIGH',
    problemSummary: 'Data classification scheme defined in policy but information labelling not implemented in practice. No systematic marking or handling of classified information.',
    evidence: {
      documents: ['doc-005'],
      interviews: [],
      findings: 'Data Classification Guidelines document defines four-tier scheme but notes labelling procedures are missing and classification is not used in practice.'
    },
    aiRecommendation: 'Implement practical information labelling system: (1) Develop easy-to-use labelling procedures and templates, (2) Add classification metadata fields to document management systems, (3) Provide labelling training to all staff, (4) Automate classification suggestions for common document types, (5) Monitor labelling compliance through periodic audits.',
    estimatedEffort: '4-6 months',
    estimatedCost: 'Low-Medium (Rp 50-150 juta)',
    impact: 'High - Without labelling, staff cannot appropriately handle sensitive information, increasing risk of inadvertent disclosure'
  },
  {
    id: 'gap-003',
    controlId: 'A.6.3',
    controlTitle: 'Security Awareness Training',
    priority: 'HIGH',
    problemSummary: 'Security awareness training exists but lacks structured curriculum, mandatory participation, completion tracking, and effectiveness assessment.',
    evidence: {
      documents: ['doc-003'],
      interviews: ['int-001', 'int-002'],
      findings: 'Training program document shows no tracking or assessment. HR manager confirmed training is voluntary with low participation. IT Security Head mentioned inability to measure effectiveness.'
    },
    aiRecommendation: 'Enhance security awareness program: (1) Make training mandatory for all staff with quarterly refreshers, (2) Implement LMS to track completion and scores, (3) Develop structured curriculum with defined learning objectives, (4) Add interactive phishing simulations, (5) Measure effectiveness through assessments and incident rate tracking, (6) Tailor training content for different roles (general staff, administrators, management).',
    estimatedEffort: '3-5 months',
    estimatedCost: 'Low-Medium (Rp 75-175 juta)',
    impact: 'High - Human factor is primary security weakness; inadequate training directly increases breach risk'
  },
  {
    id: 'gap-004',
    controlId: 'A.5.7',
    controlTitle: 'Threat Intelligence',
    priority: 'HIGH',
    problemSummary: 'No formal threat intelligence gathering, analysis, or dissemination process. Security team relies on ad-hoc information from informal sources.',
    evidence: {
      documents: [],
      interviews: ['int-004'],
      findings: 'Compliance officer confirmed absence of structured threat intelligence program, noting information gathering is informal without systematic analysis or action.'
    },
    aiRecommendation: 'Establish threat intelligence capability: (1) Subscribe to education sector threat intelligence feeds (e.g., REN-ISAC), (2) Assign dedicated staff responsibility for threat monitoring, (3) Implement threat intelligence platform for aggregation and analysis, (4) Create process for reviewing and acting on threat indicators, (5) Share relevant threat information with stakeholders, (6) Integrate threat intelligence into incident response and risk assessment.',
    estimatedEffort: '2-4 months',
    estimatedCost: 'Low-Medium (Rp 60-120 juta)',
    impact: 'Medium-High - Lack of threat awareness increases vulnerability to targeted attacks and zero-day exploits'
  },
  {
    id: 'gap-005',
    controlId: 'A.8.2',
    controlTitle: 'Privileged Access Rights',
    priority: 'HIGH',
    problemSummary: 'Privileged access rights not systematically reviewed or managed. Administrators have broader access than necessary with no activity logging.',
    evidence: {
      documents: ['doc-002'],
      interviews: ['int-003'],
      findings: 'Systems administrator acknowledged many admins have excessive access rights. No formal review process or privileged activity logging mentioned.'
    },
    aiRecommendation: 'Implement privileged access management: (1) Deploy PAM solution with session logging and monitoring, (2) Conduct immediate review of all privileged accounts and right-size permissions, (3) Implement quarterly privileged access reviews, (4) Enforce MFA for all administrative accounts, (5) Separate administrative accounts from regular user accounts, (6) Monitor and alert on suspicious privileged activities.',
    estimatedEffort: '4-6 months',
    estimatedCost: 'Medium-High (Rp 200-400 juta)',
    impact: 'High - Excessive and unmonitored privileged access creates high risk of abuse, compromise, and insider threats'
  },
  {
    id: 'gap-006',
    controlId: 'A.8.5',
    controlTitle: 'Secure Authentication',
    priority: 'MEDIUM',
    problemSummary: 'Multi-factor authentication not widely deployed beyond VPN. Password policies could be stronger. No modern authentication methods like SSO.',
    evidence: {
      documents: [],
      interviews: ['int-003'],
      findings: 'Systems administrator confirmed MFA limited to VPN and few critical systems. Broader deployment discussed but not implemented due to cost and complexity.'
    },
    aiRecommendation: 'Strengthen authentication across enterprise: (1) Phase in MFA for all users starting with high-risk systems, (2) Deploy single sign-on (SSO) solution, (3) Strengthen password policies (minimum 12 characters, complexity, no reuse), (4) Consider passwordless authentication for future, (5) Implement adaptive authentication based on risk factors, (6) Provide user-friendly MFA methods (authenticator apps, security keys).',
    estimatedEffort: '6-9 months',
    estimatedCost: 'Medium (Rp 150-300 juta)',
    impact: 'Medium-High - Weak authentication is primary attack vector for unauthorized access'
  },
  {
    id: 'gap-007',
    controlId: 'A.8.1',
    controlTitle: 'User Endpoint Devices',
    priority: 'MEDIUM',
    problemSummary: 'BYOD devices accessing university systems are not managed or secured. Limited visibility and control over personal devices.',
    evidence: {
      documents: ['doc-004'],
      interviews: ['int-003'],
      findings: 'Remote working policy mentions BYOD but systems administrator confirmed no MDM solution or security controls for personal devices.'
    },
    aiRecommendation: 'Implement BYOD security program: (1) Deploy mobile device management (MDM) or unified endpoint management (UEM) solution, (2) Require device registration for university system access, (3) Enforce minimum security baselines (encryption, screen lock, updated OS), (4) Implement containerization for university data on personal devices, (5) Provide secure remote access (VPN or zero-trust access), (6) Enable remote wipe capability for lost/stolen devices.',
    estimatedEffort: '5-7 months',
    estimatedCost: 'Medium (Rp 175-350 juta)',
    impact: 'Medium - Unmanaged BYOD devices create data leakage risk and potential malware entry points'
  },
  {
    id: 'gap-008',
    controlId: 'A.5.23',
    controlTitle: 'Cloud Services Security',
    priority: 'MEDIUM',
    problemSummary: 'Widespread cloud service usage without formal governance, security policy, or vendor assessment process. Departments adopt cloud services independently.',
    evidence: {
      documents: ['doc-007'],
      interviews: ['int-004'],
      findings: 'Draft cloud security guidelines exist but not approved. Compliance officer noted departments adopt cloud services without IT/security involvement.'
    },
    aiRecommendation: 'Establish cloud governance framework: (1) Finalize and approve cloud security policy, (2) Implement cloud vendor assessment and approval process, (3) Create approved cloud services catalog, (4) Deploy CASB (Cloud Access Security Broker) for visibility and control, (5) Define data residency and sovereignty requirements, (6) Require security review for all new cloud adoptions, (7) Inventory and assess existing cloud usage.',
    estimatedEffort: '4-6 months',
    estimatedCost: 'Medium (Rp 125-250 juta)',
    impact: 'Medium - Ungoverned cloud usage creates data sovereignty, compliance, and vendor lock-in risks'
  },
  {
    id: 'gap-009',
    controlId: 'A.5.3',
    controlTitle: 'Segregation of Duties',
    priority: 'MEDIUM',
    problemSummary: 'Segregation of duties not formally documented. System administrators have combined privileges that create conflicts of interest.',
    evidence: {
      documents: ['doc-002'],
      interviews: ['int-003'],
      findings: 'Roles document lacks segregation matrix. Systems administrator confirmed basic segregation exists but not formalized, with excessive combined privileges.'
    },
    aiRecommendation: 'Formalize segregation of duties: (1) Develop detailed segregation of duties matrix identifying conflicts, (2) Separate development and production access, (3) Review and right-size administrator privilege assignments, (4) Implement maker-checker controls for sensitive operations, (5) Document and approve necessary exceptions with compensating controls, (6) Audit segregation compliance quarterly.',
    estimatedEffort: '3-4 months',
    estimatedCost: 'Low (Rp 30-80 juta)',
    impact: 'Medium - Inadequate segregation increases fraud and error risk, reduces accountability'
  },
  {
    id: 'gap-010',
    controlId: 'A.6.8',
    controlTitle: 'Security Event Reporting',
    priority: 'LOW',
    problemSummary: 'Security incident reporting mechanism exists but not well-publicized. Staff unclear on what and when to report.',
    evidence: {
      documents: ['doc-006'],
      interviews: ['int-001', 'int-004'],
      findings: 'IT Security Head noted many incidents likely go unreported due to lack of awareness and fear of blame. Incident response document exists but reporting process not visible.'
    },
    aiRecommendation: 'Enhance incident reporting: (1) Implement dedicated, visible security incident reporting channel (email, portal, hotline), (2) Publish clear guidelines on what constitutes reportable event, (3) Train staff on reporting expectations and procedures, (4) Promote no-blame culture for good-faith reporting, (5) Provide feedback loop showing value of reports, (6) Measure and improve reporting metrics.',
    estimatedEffort: '2-3 months',
    estimatedCost: 'Low (Rp 25-60 juta)',
    impact: 'Medium - Poor reporting delays incident detection and response, preventing learning from security events'
  }
];

export const getGapById = (id) => {
  return gaps.find(gap => gap.id === id);
};

export const getGapsByPriority = (priority) => {
  return gaps.filter(gap => gap.priority === priority);
};

export const getGapsForControl = (controlId) => {
  return gaps.filter(gap => gap.controlId === controlId);
};

export const getGapsSortedByPriority = () => {
  const priorityOrder = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
  return [...gaps].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
