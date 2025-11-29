// Phase 0 Evidence Collection Checklist (40 items)
// Based on soaFlow.txt Phase 0.2 requirements

export const evidenceItems = [
  // ====================================
  // ORGANIZATION CATEGORY (10 items)
  // ====================================
  {
    category: 'Organization',
    itemName: 'Organization Structure',
    description: 'Organizational chart showing departments, teams, and reporting lines',
    required: true
  },
  {
    category: 'Organization',
    itemName: 'Asset Inventory',
    description: 'Complete inventory of IT assets including servers, applications, and data stores',
    required: true
  },
  {
    category: 'Organization',
    itemName: 'Prior Audit Results',
    description: 'Previous audit findings and recommendations (if any)',
    required: false
  },
  {
    category: 'Organization',
    itemName: 'ISMS Scope Document',
    description: 'Document defining the scope and boundaries of the ISMS',
    required: true
  },
  {
    category: 'Organization',
    itemName: 'Risk Register',
    description: 'Current risk assessment and risk treatment records',
    required: false
  },
  {
    category: 'Organization',
    itemName: 'Business Impact Analysis',
    description: 'BIA identifying critical business processes and their dependencies',
    required: true
  },
  {
    category: 'Organization',
    itemName: 'Data Flow Diagrams',
    description: 'Diagrams showing how information flows through the organization',
    required: false
  },
  {
    category: 'Organization',
    itemName: 'Third-Party Vendor List',
    description: 'List of all third-party vendors with access to organizational data',
    required: true
  },
  {
    category: 'Organization',
    itemName: 'Service Level Agreements',
    description: 'SLAs with vendors and service providers',
    required: false
  },
  {
    category: 'Organization',
    itemName: 'Management Review Records',
    description: 'Records of management reviews of the ISMS',
    required: false
  },

  // ====================================
  // POLICIES CATEGORY (10 items)
  // ====================================
  {
    category: 'Policies',
    itemName: 'ISMS Policy',
    description: 'Overall information security management system policy',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Information Security Policy',
    description: 'Specific security controls and requirements policy',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Acceptable Use Policy',
    description: 'Policy defining acceptable use of organizational resources',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Password Policy',
    description: 'Password complexity and authentication requirements',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Backup and Recovery Policy',
    description: 'Data backup and disaster recovery procedures',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Incident Management Policy',
    description: 'Security incident response and escalation procedures',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Vendor Management Policy',
    description: 'Third-party security assessment and management requirements',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Data Classification Policy',
    description: 'Information classification and labeling requirements',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Access Control Policy',
    description: 'User access provisioning, review, and revocation procedures',
    required: true
  },
  {
    category: 'Policies',
    itemName: 'Change Management Policy',
    description: 'IT change control and approval procedures',
    required: false
  },

  // ====================================
  // TECHNICAL CATEGORY (8 items)
  // ====================================
  {
    category: 'Technical',
    itemName: 'System Architecture Diagram',
    description: 'High-level and detailed architecture diagrams of IT systems',
    required: true
  },
  {
    category: 'Technical',
    itemName: 'Network Diagram',
    description: 'Network topology showing zones, firewalls, and DMZs',
    required: true
  },
  {
    category: 'Technical',
    itemName: 'SDLC Documentation',
    description: 'Software development lifecycle procedures and standards',
    required: false
  },
  {
    category: 'Technical',
    itemName: 'Network Security Policy',
    description: 'Firewall rules, IDS/IPS configuration, and network segmentation',
    required: true
  },
  {
    category: 'Technical',
    itemName: 'Vulnerability Scan Reports',
    description: 'Recent vulnerability assessment and penetration test results',
    required: false
  },
  {
    category: 'Technical',
    itemName: 'Patch Management Records',
    description: 'Documentation of system patching and update procedures',
    required: true
  },
  {
    category: 'Technical',
    itemName: 'Encryption Standards',
    description: 'Cryptographic controls and key management procedures',
    required: false
  },
  {
    category: 'Technical',
    itemName: 'Antivirus/EDR Configuration',
    description: 'Malware protection system configuration and logs',
    required: true
  },

  // ====================================
  // HR CATEGORY (7 items)
  // ====================================
  {
    category: 'HR',
    itemName: 'Job Descriptions',
    description: 'Role definitions including security responsibilities',
    required: true
  },
  {
    category: 'HR',
    itemName: 'HR Onboarding SOP',
    description: 'Employee onboarding procedures including security training',
    required: true
  },
  {
    category: 'HR',
    itemName: 'HR Offboarding SOP',
    description: 'Employee termination procedures including access revocation',
    required: true
  },
  {
    category: 'HR',
    itemName: 'NDA Templates',
    description: 'Non-disclosure agreement templates for employees and contractors',
    required: true
  },
  {
    category: 'HR',
    itemName: 'Security Awareness Training Records',
    description: 'Records of security training completion by employees',
    required: false
  },
  {
    category: 'HR',
    itemName: 'Background Check Procedures',
    description: 'Employee screening and verification procedures',
    required: true
  },
  {
    category: 'HR',
    itemName: 'Code of Conduct',
    description: 'Employee code of conduct including security expectations',
    required: false
  },

  // ====================================
  // INFRASTRUCTURE CATEGORY (5 items)
  // ====================================
  {
    category: 'Infrastructure',
    itemName: 'Business Continuity Plan',
    description: 'BCP/DR documentation and procedures',
    required: true
  },
  {
    category: 'Infrastructure',
    itemName: 'Physical Security Controls',
    description: 'Datacenter/office access controls, CCTV, badges, visitor logs',
    required: true
  },
  {
    category: 'Infrastructure',
    itemName: 'Environmental Controls',
    description: 'Fire suppression, cooling, power backup (UPS/generator) documentation',
    required: false
  },
  {
    category: 'Infrastructure',
    itemName: 'Backup Verification Logs',
    description: 'Records of successful backups and restoration tests',
    required: true
  },
  {
    category: 'Infrastructure',
    itemName: 'Equipment Maintenance Records',
    description: 'Records of hardware maintenance and lifecycle management',
    required: false
  }
];

// Summary: 40 evidence items across 5 categories
// Organization: 10 items
// Policies: 10 items
// Technical: 8 items
// HR: 7 items
// Infrastructure: 5 items
