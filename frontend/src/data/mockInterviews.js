// Mock Interviews Data

export const interviews = [
  {
    id: 'int-001',
    respondent: {
      name: 'Dr. Ahmad Susanto',
      role: 'Head of IT Security',
      division: 'Directorate of IT (DTI)'
    },
    date: '2024-11-10',
    questions: [
      {
        id: 'q1',
        text: 'How are information security policies communicated to staff?',
        answer: 'We communicate policies through multiple channels. New employee orientation sessions include a security briefing, and we send quarterly security awareness emails to all staff. Policies are also posted on our internal wiki, accessible to everyone. Additionally, we have notice boards in key areas with policy highlights. However, I must admit that we sometimes struggle with ensuring everyone actually reads and understands them.',
        annexAMapping: ['A.5.1', 'A.6.3']
      },
      {
        id: 'q2',
        text: 'What procedures exist for reviewing and updating security policies?',
        answer: 'Currently, policies are reviewed annually by the security committee, which includes representatives from IT, legal, and HR. However, we sometimes miss the schedule due to workload pressures. Updates are also triggered by major incidents or when there are regulatory changes. We know we should move to a more frequent review cycle, perhaps quarterly, especially for our most critical policies.',
        annexAMapping: ['A.5.1']
      },
      {
        id: 'q3',
        text: 'How are security responsibilities allocated across the organization?',
        answer: 'Each department has a designated security liaison who coordinates with our central team. These responsibilities are defined in job descriptions and shown in the organizational chart. The security liaisons are our main point of contact for their departments and help implement security measures. However, there is sometimes confusion about exactly who is responsible for what, especially when issues cross department boundaries.',
        annexAMapping: ['A.5.2', 'A.6.2']
      },
      {
        id: 'q4',
        text: 'Describe the current security awareness training program.',
        answer: 'We conduct quarterly security training sessions that cover topics like password security, phishing awareness, and data protection. New employees get training during orientation. We send regular security tips via email. However, we don\'t have a good system for tracking who has completed the training, and there is no assessment to verify understanding. This is something we need to improve.',
        annexAMapping: ['A.6.3']
      },
      {
        id: 'q5',
        text: 'How are security incidents currently reported and handled?',
        answer: 'Staff can report incidents through our IT help desk ticketing system or by directly contacting the security team. We respond to all reported incidents, but I think many incidents go unreported because staff are not sure what constitutes a security incident, or they fear blame. We need to do better at creating a no-blame culture and making the reporting process more visible and accessible.',
        annexAMapping: ['A.6.8']
      }
    ],
    aiAnalysis: {
      summary: 'Strong awareness of policy communication needs with multi-channel approach (orientation, email, wiki, notice boards). Annual policy review exists but shows inconsistency due to resource constraints. Clear delegation of security responsibilities through liaison model, though boundary confusion exists. Security training program operational but lacks tracking and effectiveness measurement. Incident reporting mechanism in place but under-utilized due to lack of awareness and fear of blame.',
      keyStatements: [
        'Quarterly security training sessions covering passwords, phishing, and data protection',
        'Security policies communicated through orientation, email campaigns, and internal wiki',
        'Each department has designated security liaison coordinating with central team',
        'Annual policy reviews sometimes missed due to workload pressures',
        'Many incidents likely go unreported due to staff uncertainty and fear of blame'
      ],
      annexAMapping: ['A.5.1', 'A.5.2', 'A.6.2', 'A.6.3', 'A.6.8'],
      contradictions: [
        'States annual policy review process exists but mentions schedule is sometimes missed - indicates gap between policy and practice',
        'Claims security responsibilities are clearly defined in job descriptions and org chart, but also mentions confusion about cross-department responsibilities'
      ],
      maturityScore: 4
    }
  },
  {
    id: 'int-002',
    respondent: {
      name: 'Ibu Siti Rahayu',
      role: 'HR Manager',
      division: 'People Development Division'
    },
    date: '2024-11-08',
    questions: [
      {
        id: 'q1',
        text: 'What background screening is conducted for new employees?',
        answer: 'We conduct comprehensive background checks for all new employees. This includes verification of educational credentials, reference checks with previous employers, and identity verification. For positions with access to sensitive data, we also perform additional checks. However, we don\'t currently extend these screening procedures to contractors or temporary staff, which is a gap we\'ve identified.',
        annexAMapping: ['A.6.1']
      },
      {
        id: 'q2',
        text: 'Are security responsibilities included in employment contracts?',
        answer: 'Yes, all employment contracts include a confidentiality clause and reference to university security policies. Employees must sign an acknowledgment that they have received and will comply with these policies. The contracts also outline consequences for security breaches. We updated our contract template last year to strengthen these provisions.',
        annexAMapping: ['A.6.2', 'A.6.6']
      },
      {
        id: 'q3',
        text: 'What happens when an employee leaves the university?',
        answer: 'We have an exit checklist that includes IT access termination, asset return, and a brief exit interview. However, we don\'t systematically remind departing employees of their ongoing confidentiality obligations. This is something we should add to our exit process. The IT department usually handles access removal promptly, but sometimes there are delays in returning physical assets.',
        annexAMapping: ['A.6.5']
      },
      {
        id: 'q4',
        text: 'How is information security incorporated into the disciplinary process?',
        answer: 'Our general staff code of conduct covers information security, and violations can result in disciplinary action ranging from warnings to termination. However, we don\'t have specific guidelines for different types of security breaches. Each case is handled somewhat ad-hoc, which leads to inconsistency. We need to develop clearer procedures for investigating and addressing security violations.',
        annexAMapping: ['A.6.4']
      },
      {
        id: 'q5',
        text: 'How effective is the current security training program?',
        answer: 'The training content is good when people attend, but participation is voluntary and inconsistent. We don\'t track completion rates or measure effectiveness through assessments. Many staff view it as optional rather than mandatory. If we want to improve our security culture, we need to make training mandatory and track compliance.',
        annexAMapping: ['A.6.3']
      }
    ],
    aiAnalysis: {
      summary: 'Robust pre-employment screening with educational and reference verification, but gaps exist for contractors and temporary staff. Employment contracts include strong confidentiality provisions and policy acknowledgments. Exit procedures cover basic IT access and asset return but lack systematic communication of post-employment obligations. Disciplinary process for security breaches exists but lacks specificity and consistency. Security training content is adequate but suffers from low participation due to voluntary status and absence of tracking mechanisms.',
      keyStatements: [
        'Comprehensive background checks for all new employees including credentials and references',
        'Employment contracts updated last year to strengthen security and confidentiality provisions',
        'Exit checklist includes IT access termination and asset return',
        'No specific guidelines for different types of security breaches - handled ad-hoc',
        'Security training is voluntary with no completion tracking or effectiveness measurement'
      ],
      annexAMapping: ['A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6'],
      contradictions: [
        'Strong pre-employment screening described but explicitly excludes contractors and temporary staff who may have same access levels'
      ],
      maturityScore: 3
    }
  },
  {
    id: 'int-003',
    respondent: {
      name: 'Pak Budi Santoso',
      role: 'Systems Administrator',
      division: 'DTI - ugm.ac.id Domain Management'
    },
    date: '2024-11-05',
    questions: [
      {
        id: 'q1',
        text: 'How are privileged access rights currently managed?',
        answer: 'Admin accounts are created as needed for system administrators and some senior IT staff. We try to follow the principle of least privilege, but in practice many admins have broader access than they strictly need for day-to-day work. We don\'t have a formal process for reviewing who has admin rights or a system for logging privileged activities. This is a known weakness.',
        annexAMapping: ['A.5.3', 'A.8.2']
      },
      {
        id: 'q2',
        text: 'Describe the physical security measures for the server room.',
        answer: 'The server room is located in a secure area with locked doors. Only a limited number of staff have keys, though they are physical keys, not a card-based system. We don\'t have CCTV monitoring in the server room currently, and there is no automated log of who enters and exits. The room has environmental controls for temperature and humidity, and fire suppression, but physical access monitoring is definitely an area for improvement.',
        annexAMapping: ['A.7.1', 'A.7.2', 'A.7.4']
      },
      {
        id: 'q3',
        text: 'How is asset inventory maintained for IT systems and information?',
        answer: 'We maintain a spreadsheet inventory of all hardware - servers, network equipment, workstations, etc. This is updated when new equipment is purchased or old equipment is decommissioned. However, we don\'t have a comprehensive inventory of information assets or data repositories. We know where the major databases are, but there\'s no systematic cataloging of all information assets or clear ownership assignments.',
        annexAMapping: ['A.5.9']
      },
      {
        id: 'q4',
        text: 'What authentication methods are currently in use?',
        answer: 'Most systems use password-based authentication with LDAP integration for centralized account management. We have password complexity requirements, though they could be stronger. Multi-factor authentication is only deployed for VPN access and a few critical systems, not across the board. We\'ve been discussing broader MFA deployment but haven\'t implemented it yet due to cost and complexity concerns.',
        annexAMapping: ['A.8.5']
      },
      {
        id: 'q5',
        text: 'How are endpoint devices managed and secured?',
        answer: 'University-owned computers have antivirus software and are part of our patch management system. However, we have limited visibility and control over BYOD devices that access university systems. Many faculty and students use personal devices, and we don\'t have an MDM solution to manage or secure these devices. This is a significant gap, especially with increasing remote work.',
        annexAMapping: ['A.8.1', 'A.6.7']
      }
    ],
    aiAnalysis: {
      summary: 'Privileged access management shows significant weaknesses with broad access rights, no systematic reviews, and absent activity logging. Physical security has basic controls (locked doors) but lacks modern monitoring (CCTV, access logging) and uses outdated key-based access. Asset inventory exists for hardware but information assets remain uncatalogued with unclear ownership. Authentication relies primarily on passwords with limited MFA deployment beyond VPN. Endpoint security covers university-owned devices but BYOD devices lack management and security controls.',
      keyStatements: [
        'Many administrators have broader access than strictly needed for daily work',
        'Server room has locked doors and environmental controls but no CCTV or access logging',
        'Hardware inventory maintained but no systematic information asset cataloging',
        'MFA only deployed for VPN and few critical systems, not enterprise-wide',
        'Limited visibility and control over BYOD devices accessing university systems'
      ],
      annexAMapping: ['A.5.3', 'A.5.9', 'A.6.7', 'A.7.1', 'A.7.2', 'A.7.4', 'A.8.1', 'A.8.2', 'A.8.5'],
      contradictions: [],
      maturityScore: 2
    }
  },
  {
    id: 'int-004',
    respondent: {
      name: 'Dr. Wulan Pertiwi',
      role: 'Compliance Officer',
      division: 'DTI'
    },
    date: '2024-11-03',
    questions: [
      {
        id: 'q1',
        text: 'How does UGM currently approach cloud service security?',
        answer: 'We use several cloud services including Google Workspace for email and collaboration, and various SaaS applications for specific functions. However, we don\'t have a formal cloud security policy or a systematic vendor assessment process. Departments sometimes adopt cloud services without involving IT or security, which creates governance challenges. We\'ve drafted cloud security guidelines but they haven\'t been formally approved yet.',
        annexAMapping: ['A.5.23']
      },
      {
        id: 'q2',
        text: 'Are there processes for gathering threat intelligence?',
        answer: 'Currently, we don\'t have a structured threat intelligence program. We follow some security news sources and vendor alerts informally, but there\'s no systematic process for collecting, analyzing, or acting on threat information. This would be valuable, especially given the increase in targeted attacks on educational institutions. It\'s an area we need to develop.',
        annexAMapping: ['A.5.7']
      },
      {
        id: 'q3',
        text: 'How is information security integrated into project management?',
        answer: 'For major IT projects, security is typically considered as part of the planning and design phases. However, smaller projects or projects led by departments outside of IT don\'t always include security reviews. We don\'t have a mandatory security review checkpoint in our project methodology. This should be formalized so security isn\'t an afterthought.',
        annexAMapping: ['A.5.8']
      },
      {
        id: 'q4',
        text: 'Describe the current approach to physical access control.',
        answer: 'The main building has a security guard and visitor sign-in, but access to most areas is not restricted. Server rooms and sensitive areas have locked doors. We\'ve been discussing implementing a card-based access control system for better monitoring and control, but budget constraints have delayed implementation. Current system is adequate for basic security but doesn\'t provide the audit trail we need.',
        annexAMapping: ['A.7.1', 'A.7.2']
      }
    ],
    aiAnalysis: {
      summary: 'Cloud service usage is widespread but lacks governance framework, formal security policy, and vendor assessment procedures. Draft guidelines exist but await approval. Threat intelligence gathering is informal and ad-hoc with no systematic collection or analysis process. Security integration in project management is inconsistent - present in major IT projects but absent in smaller or non-IT projects. Physical access control relies on basic measures (guards, locked doors) without modern card-based systems or audit capabilities.',
      keyStatements: [
        'Cloud services adopted by departments without IT or security involvement',
        'Draft cloud security guidelines exist but not formally approved',
        'No structured threat intelligence program - information gathering is informal',
        'Major IT projects include security but not formalized for all projects',
        'Card-based access control system discussed but delayed by budget constraints'
      ],
      annexAMapping: ['A.5.7', 'A.5.8', 'A.5.23', 'A.7.1', 'A.7.2'],
      contradictions: [],
      maturityScore: 2
    }
  }
];

export const getInterviewById = (id) => {
  return interviews.find(interview => interview.id === id);
};

export const getInterviewsForControl = (controlId) => {
  return interviews.filter(interview =>
    interview.aiAnalysis.annexAMapping.includes(controlId)
  );
};

export const getAverageMaturityScore = () => {
  const sum = interviews.reduce((acc, interview) => acc + interview.aiAnalysis.maturityScore, 0);
  return (sum / interviews.length).toFixed(1);
};
