// Mock Documents Data

export const documents = [
  {
    id: 'doc-001',
    title: 'UGM Information Security Policy 2024',
    uploadDate: '2024-11-15',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    status: 'verified',
    summaries: {
      short: 'Campus-wide information security policy covering access control, data classification, incident management, and acceptable use of university IT resources.',
      detailed: 'Comprehensive security policy document outlining organizational commitment to information security, governance structure, roles and responsibilities, asset management procedures, access control guidelines, incident response protocols, and compliance requirements aligned with ISO 27001 standards. Applies to all UGM staff, students, and contractors.',
      isoCompliance: 'Addresses controls A.5.1 (Security Policies), A.5.2 (Roles & Responsibilities), A.5.10 (Acceptable Use), A.5.14 (Information Transfer), and A.8.3 (Access Restriction). Strong alignment with organizational controls category. Policy framework provides foundation for security program.'
    },
    annexAMapping: ['A.5.1', 'A.5.2', 'A.5.10', 'A.5.14', 'A.7.7', 'A.8.3'],
    gapAnalysis: {
      missing: [
        'Physical security procedures for server rooms and data centers',
        'Detailed incident response timeline and escalation matrix',
        'Cloud services security requirements and governance'
      ],
      weaknesses: [
        'Access control guidelines are high-level and lack specific requirements',
        'No mention of mobile device management policies',
        'Data classification scheme mentioned but labelling procedures absent',
        'Remote working security requirements need expansion'
      ]
    }
  },
  {
    id: 'doc-002',
    title: 'IT Security Roles and Responsibilities - DTI',
    uploadDate: '2024-10-22',
    fileType: 'DOCX',
    fileSize: '1.1 MB',
    status: 'analyzed',
    summaries: {
      short: 'Document outlining IT security team structure, role definitions, and responsibilities within DTI organization.',
      detailed: 'Defines organizational structure of DTI security team including positions for Head of IT Security, Security Officers, System Administrators, and Compliance Auditors. Describes key responsibilities for each role and reporting relationships. Includes liaison model with departmental security coordinators.',
      isoCompliance: 'Partially addresses A.5.2 (Roles and Responsibilities) and A.6.2 (Terms of Employment). Lacks detail on segregation of duties (A.5.3) and privileged access management (A.8.2). Missing approval workflows and decision authority matrix.'
    },
    annexAMapping: ['A.5.2', 'A.5.3', 'A.6.2', 'A.8.2'],
    gapAnalysis: {
      missing: [
        'Segregation of duties matrix',
        'Approval workflows and authorization levels',
        'Business continuity roles and responsibilities',
        'Third-party and vendor management roles'
      ],
      weaknesses: [
        'Overlapping responsibilities between central team and department liaisons',
        'Unclear escalation paths for security incidents',
        'No definition of security champion role in faculties'
      ]
    }
  },
  {
    id: 'doc-003',
    title: 'Employee Security Awareness Training Program',
    uploadDate: '2024-09-18',
    fileType: 'PDF',
    fileSize: '890 KB',
    status: 'analyzed',
    summaries: {
      short: 'Overview of security awareness training program for UGM employees, covering training content, delivery methods, and schedules.',
      detailed: 'Describes quarterly security awareness training program including topics such as password security, phishing awareness, data protection, and acceptable use. Outlines training delivery through orientation sessions, email campaigns, and  periodic workshops. Includes HR screening and employment contract requirements.',
      isoCompliance: 'Addresses A.6.1 (Screening), A.6.2 (Terms and Conditions), A.6.3 (Awareness Training), A.6.4 (Disciplinary Process), A.6.5 (Post-Employment), and A.6.6 (NDAs). Good coverage of people controls but lacks implementation metrics and effectiveness measurement.'
    },
    annexAMapping: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6'],
    gapAnalysis: {
      missing: [
        'Training completion tracking and reporting',
        'Assessment of training effectiveness',
        'Role-specific security training for administrators',
        'Phishing simulation program'
      ],
      weaknesses: [
        'No structured curriculum or learning objectives',
        'Lack of mandatory completion requirements',
        'No refresher training schedule',
        'Limited coverage of emerging threats'
      ]
    }
  },
  {
    id: 'doc-004',
    title: 'Remote Working and BYOD Policy',
    uploadDate: '2024-08-25',
    fileType: 'PDF',
    fileSize: '680 KB',
    status: 'verified',
    summaries: {
      short: 'Policy governing remote work arrangements and bring-your-own-device (BYOD) usage for university staff.',
      detailed: 'Establishes requirements for remote working including VPN usage, secure Wi-Fi connections, physical security of work areas, and data handling. Defines BYOD acceptable use, security requirements, supported device types, and university data access restrictions. Includes endpoint security guidelines.',
      isoCompliance: 'Addresses A.6.7 (Remote Working), A.8.1 (User Endpoint Devices), and A.5.10 (Acceptable Use). Provides good foundation but enforcement mechanisms and monitoring procedures need strengthening.'
    },
    annexAMapping: ['A.5.10', 'A.6.7', 'A.8.1'],
    gapAnalysis: {
      missing: [
        'Endpoint security software requirements for BYOD',
        'Data encryption requirements for remote devices',
        'Procedures for lost or stolen device reporting',
        'Remote access audit and monitoring'
      ],
      weaknesses: [
        'Weak enforcement of VPN usage requirements',
        'Limited technical controls for BYOD devices',
        'No device registration or inventory process',
        'Unclear consequences for policy violations'
      ]
    }
  },
  {
    id: 'doc-005',
    title: 'Data Classification and Handling Guidelines',
    uploadDate: '2024-07-30',
    fileType: 'PDF',
    fileSize: '1.3 MB',
    status: 'analyzed',
    summaries: {
      short: 'Guidelines for classifying and handling university information assets based on sensitivity and confidentiality.',
      detailed: 'Defines four-tier classification scheme (Public, Internal, Confidential, Restricted) with criteria for each level. Outlines handling requirements including storage, transmission, disposal, and access control for each classification level. Includes asset inventory requirements.',
      isoCompliance: 'Addresses A.5.9 (Asset Inventory), A.5.13 (Information Labelling), A.5.14 (Information Transfer), and A.8.3 (Access Restriction). Strong policy framework but implementation and labelling procedures missing.'
    },
    annexAMapping: ['A.5.9', 'A.5.13', 'A.5.14', 'A.8.3'],
    gapAnalysis: {
      missing: [
        'Practical labelling procedures and tools',
        'Data classification training for staff',
        'Automated classification for digital assets',
        'Asset owner responsibilities and accountability'
      ],
      weaknesses: [
        'Classification scheme not implemented in practice',
        'Information assets not systematically inventoried',
        'No validation of asset ownership',
        'Disposal procedures incomplete'
      ]
    }
  },
  {
    id: 'doc-006',
    title: 'Incident Response and Business Continuity Procedures',
    uploadDate: '2024-06-12',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    status: 'verified',
    summaries: {
      short: 'Procedures for responding to security incidents and maintaining business continuity during disruptions.',
      detailed: 'Defines incident classification scheme, response procedures, escalation matrix, and communication protocols. Includes business continuity planning for critical IT systems, backup procedures, recovery time objectives, and testing requirements. Covers both security incidents and operational disruptions.',
      isoCompliance: 'Addresses A.6.8 (Event Reporting), A.5.8 (Project Management), A.5.29 (Security During Disruption), and A.5.30 (ICT Readiness). Good coverage but security-specific incident procedures need enhancement.'
    },
    annexAMapping: ['A.5.8', 'A.5.29', 'A.5.30', 'A.6.8'],
    gapAnalysis: {
      missing: [
        'Security incident classification and prioritization',
        'Forensic investigation procedures',
        'External incident reporting requirements',
        'Post-incident review process'
      ],
      weaknesses: [
        'Incident reporting mechanism not well-publicized',
        'Response team roles and contact information outdated',
        'Security considerations in BCP not comprehensive',
        'Limited testing of security incident response'
      ]
    }
  },
  {
    id: 'doc-007',
    title: 'Cloud Services Security Guidelines',
    uploadDate: '2024-05-20',
    fileType: 'DOCX',
    fileSize: '720 KB',
    status: 'raw',
    summaries: {
      short: 'Draft guidelines for secure use of cloud services including vendor assessment and data protection requirements.',
      detailed: 'Preliminary guidelines addressing cloud service procurement, vendor due diligence, data residency requirements, access control, and exit planning. Covers major cloud platforms (AWS, Azure, Google Cloud) and SaaS applications. Still in draft status pending stakeholder review.',
      isoCompliance: 'Intended to address A.5.23 (Cloud Security) but document is still in draft. Provides foundation but needs formalization and approval. Missing operational procedures and governance framework.'
    },
    annexAMapping: ['A.5.23'],
    gapAnalysis: {
      missing: [
        'Formal approval and publication',
        'Cloud vendor assessment checklist',
        'Data sovereignty and residency policy',
        'Cloud service inventory and oversight',
        'Exit planning procedures'
      ],
      weaknesses: [
        'Document not finalized or officially adopted',
        'Limited technical security requirements',
        'No governance framework for cloud usage',
        'Vendor risk assessment process undefined'
      ]
    }
  }
];

export const getDocumentById = (id) => {
  return documents.find(doc => doc.id === id);
};

export const getDocumentsByStatus = (status) => {
  return documents.filter(doc => doc.status === status);
};

export const getDocumentsForControl = (controlId) => {
  return documents.filter(doc => doc.annexAMapping.includes(controlId));
};
