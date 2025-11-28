// Seed script for NovaTrix database
// Populates initial data from frontend mock files

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Annex A Controls Data (from frontend/src/data/mockAnnexA.js)
const annexAControls = [
  // A.5 - ORGANIZATIONAL CONTROLS
  {
    id: 'A.5.1',
    category: 'ORGANIZATIONAL',
    title: 'Policies for information security',
    description: 'Information security policy and topic-specific policies should be defined, approved, published, communicated and acknowledged by relevant personnel and interested parties.',
    status: 'compliant',
    rating: 85,
    explanation: 'Well-documented security policies exist and are regularly reviewed. Policies are communicated through multiple channels including orientation and internal wiki.',
    suggestedActions: [
      { actionText: 'Update policy review schedule to quarterly instead of annually', priority: 'medium' },
      { actionText: 'Add cloud security policy appendix', priority: 'high' },
      { actionText: 'Implement policy acknowledgment tracking system', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.2',
    category: 'ORGANIZATIONAL',
    title: 'Information security roles and responsibilities',
    description: 'Information security roles and responsibilities should be defined and allocated according to the organization needs.',
    status: 'partial',
    rating: 60,
    explanation: 'Roles are documented but responsibilities lack clarity. Overlapping duties between security team and department liaisons cause confusion.',
    suggestedActions: [
      { actionText: 'Create detailed RACI matrix for all security responsibilities', priority: 'high' },
      { actionText: 'Define escalation procedures clearly', priority: 'high' },
      { actionText: 'Clarify overlap between central IT security and departmental roles', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.3',
    category: 'ORGANIZATIONAL',
    title: 'Segregation of duties',
    description: 'Conflicting duties and conflicting areas of responsibility should be segregated.',
    status: 'partial',
    rating: 55,
    explanation: 'Basic segregation exists but not formally documented. System administrators have excessive combined privileges.',
    suggestedActions: [
      { actionText: 'Implement formal segregation of duties matrix', priority: 'high' },
      { actionText: 'Separate development and production access', priority: 'high' },
      { actionText: 'Review administrator privilege assignments', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.7',
    category: 'ORGANIZATIONAL',
    title: 'Threat intelligence',
    description: 'Information relating to information security threats should be collected and analyzed to produce threat intelligence.',
    status: 'non-compliant',
    rating: 30,
    explanation: 'No formal threat intelligence gathering or analysis process. Security team relies on ad-hoc information sources.',
    suggestedActions: [
      { actionText: 'Subscribe to relevant threat intelligence feeds', priority: 'high' },
      { actionText: 'Establish process for reviewing and acting on threat data', priority: 'high' },
      { actionText: 'Assign responsibility for threat monitoring', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.8',
    category: 'ORGANIZATIONAL',
    title: 'Information security in project management',
    description: 'Information security should be integrated in project management.',
    status: 'partial',
    rating: 50,
    explanation: 'Security considerations are included in major IT projects but not systematically applied across all projects.',
    suggestedActions: [
      { actionText: 'Create security requirements checklist for all projects', priority: 'medium' },
      { actionText: 'Include security review in project approval process', priority: 'high' },
      { actionText: 'Train project managers on security integration', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.9',
    category: 'ORGANIZATIONAL',
    title: 'Inventory of information and other associated assets',
    description: 'An inventory of information and other associated assets, including owners, should be developed and maintained.',
    status: 'partial',
    rating: 65,
    explanation: 'Hardware inventory exists but information assets are not comprehensively catalogued. Asset ownership not clearly defined.',
    suggestedActions: [
      { actionText: 'Expand inventory to include information assets and data', priority: 'high' },
      { actionText: 'Assign and document asset owners', priority: 'high' },
      { actionText: 'Implement asset management system', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.10',
    category: 'ORGANIZATIONAL',
    title: 'Acceptable use of information and other associated assets',
    description: 'Rules for the acceptable use of information and other associated assets should be identified, documented and implemented.',
    status: 'compliant',
    rating: 75,
    explanation: 'Acceptable use policy documented and communicated to all staff. Included in employment agreements.',
    suggestedActions: [
      { actionText: 'Add specific guidelines for social media use', priority: 'low' },
      { actionText: 'Update policy for remote work scenarios', priority: 'medium' },
      { actionText: 'Implement periodic acknowledgment requirement', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.13',
    category: 'ORGANIZATIONAL',
    title: 'Labelling of information',
    description: 'An appropriate set of procedures for information labelling should be developed and implemented.',
    status: 'non-compliant',
    rating: 25,
    explanation: 'Data classification scheme exists in policy but labelling is not implemented in practice.',
    suggestedActions: [
      { actionText: 'Implement document classification system', priority: 'high' },
      { actionText: 'Train staff on information labelling requirements', priority: 'high' },
      { actionText: 'Add classification fields to document templates', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.14',
    category: 'ORGANIZATIONAL',
    title: 'Information transfer',
    description: 'Information transfer rules, procedures, or agreements should be in place for all types of transfer facilities.',
    status: 'partial',
    rating: 58,
    explanation: 'Email security guidelines exist but file transfer procedures are incomplete. No formal agreements for external transfers.',
    suggestedActions: [
      { actionText: 'Document secure file transfer procedures', priority: 'high' },
      { actionText: 'Implement approved file sharing solution', priority: 'high' },
      { actionText: 'Create template agreements for data transfer with external parties', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.23',
    category: 'ORGANIZATIONAL',
    title: 'Information security for use of cloud services',
    description: 'Processes for acquisition, use, management and exit from cloud services should be established.',
    status: 'partial',
    rating: 45,
    explanation: 'Cloud services are used but governance is weak. No formal cloud security policy or vendor assessment process.',
    suggestedActions: [
      { actionText: 'Develop cloud security policy', priority: 'high' },
      { actionText: 'Implement cloud service vendor assessment procedure', priority: 'high' },
      { actionText: 'Document data residency and sovereignty requirements', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.29',
    category: 'ORGANIZATIONAL',
    title: 'Information security during disruption',
    description: 'The organization should plan how to maintain information security at an appropriate level during disruption.',
    status: 'partial',
    rating: 52,
    explanation: 'Business continuity plan exists but information security aspects not fully addressed.',
    suggestedActions: [
      { actionText: 'Integrate security requirements into BCP', priority: 'high' },
      { actionText: 'Define security priorities during disruption', priority: 'medium' },
      { actionText: 'Test security controls in disruption scenarios', priority: 'medium' }
    ]
  },
  {
    id: 'A.5.30',
    category: 'ORGANIZATIONAL',
    title: 'ICT readiness for business continuity',
    description: 'ICT readiness should be planned, implemented, maintained and tested based on business continuity objectives and ICT continuity requirements.',
    status: 'compliant',
    rating: 70,
    explanation: 'System backups and redundancy in place for critical systems. Regular backup testing performed.',
    suggestedActions: [
      { actionText: 'Expand disaster recovery testing to include security systems', priority: 'medium' },
      { actionText: 'Document recovery time objectives for all critical systems', priority: 'medium' },
      { actionText: 'Implement off-site backup verification', priority: 'low' }
    ]
  },
  // A.6 - PEOPLE CONTROLS
  {
    id: 'A.6.1',
    category: 'PEOPLE',
    title: 'Screening',
    description: 'Background verification checks on all candidates for employment should be carried out prior to joining the organization.',
    status: 'compliant',
    rating: 80,
    explanation: 'HR conducts background checks for all new employees including reference verification and educational credential checks.',
    suggestedActions: [
      { actionText: 'Extend screening to contract workers and vendors', priority: 'medium' },
      { actionText: 'Implement periodic re-screening for sensitive positions', priority: 'low' },
      { actionText: 'Add social media screening component', priority: 'low' }
    ]
  },
  {
    id: 'A.6.2',
    category: 'PEOPLE',
    title: 'Terms and conditions of employment',
    description: 'The employment contractual agreements should state the employee and the organization responsibilities for information security.',
    status: 'compliant',
    rating: 78,
    explanation: 'Employment contracts include confidentiality clauses and reference to security policies. Employees sign acknowledgment.',
    suggestedActions: [
      { actionText: 'Update contract template with specific data protection obligations', priority: 'medium' },
      { actionText: 'Add provisions for post-employment data access restrictions', priority: 'medium' },
      { actionText: 'Clarify personal device usage terms', priority: 'low' }
    ]
  },
  {
    id: 'A.6.3',
    category: 'PEOPLE',
    title: 'Information security awareness, education and training',
    description: 'Personnel of the organization and relevant interested parties should receive appropriate information security awareness, education and training.',
    status: 'partial',
    rating: 62,
    explanation: 'Security awareness training exists but lacks structured curriculum. No completion tracking or effectiveness measurement.',
    suggestedActions: [
      { actionText: 'Develop comprehensive security awareness program', priority: 'high' },
      { actionText: 'Implement learning management system for tracking', priority: 'medium' },
      { actionText: 'Add phishing simulation exercises', priority: 'high' },
      { actionText: 'Make training mandatory with quarterly refreshers', priority: 'high' }
    ]
  },
  {
    id: 'A.6.4',
    category: 'PEOPLE',
    title: 'Disciplinary process',
    description: 'A disciplinary process should be formalized and communicated to take actions against personnel who have committed an information security breach.',
    status: 'partial',
    rating: 48,
    explanation: 'General disciplinary process exists but specific procedures for security breaches not clearly defined.',
    suggestedActions: [
      { actionText: 'Define specific disciplinary actions for security violations', priority: 'high' },
      { actionText: 'Document security incident investigation procedures', priority: 'high' },
      { actionText: 'Clarify roles in security breach investigations', priority: 'medium' }
    ]
  },
  {
    id: 'A.6.5',
    category: 'PEOPLE',
    title: 'Responsibilities after termination or change of employment',
    description: 'Information security responsibilities and duties that remain valid after termination or change of employment should be defined, enforced and communicated.',
    status: 'partial',
    rating: 55,
    explanation: 'Exit procedures include IT access termination but post-employment confidentiality obligations not systematically communicated.',
    suggestedActions: [
      { actionText: 'Implement formal exit interview with security checklist', priority: 'medium' },
      { actionText: 'Clarify ongoing confidentiality obligations', priority: 'high' },
      { actionText: 'Document asset return procedures', priority: 'medium' }
    ]
  },
  {
    id: 'A.6.6',
    category: 'PEOPLE',
    title: 'Confidentiality or non-disclosure agreements',
    description: 'Confidentiality or non-disclosure agreements should reflect the organization needs for the protection of information.',
    status: 'compliant',
    rating: 75,
    explanation: 'NDAs in place for employees and vendors handling sensitive information.',
    suggestedActions: [
      { actionText: 'Review NDA template for comprehensiveness', priority: 'low' },
      { actionText: 'Extend NDA requirements to research collaborators', priority: 'medium' },
      { actionText: 'Implement NDA tracking system', priority: 'low' }
    ]
  },
  {
    id: 'A.6.7',
    category: 'PEOPLE',
    title: 'Remote working',
    description: 'Security measures should be implemented when personnel are working remotely to protect information.',
    status: 'partial',
    rating: 58,
    explanation: 'Remote working policy exists with VPN requirements, but enforcement and monitoring are weak.',
    suggestedActions: [
      { actionText: 'Strengthen remote access security controls', priority: 'high' },
      { actionText: 'Implement endpoint security for remote devices', priority: 'high' },
      { actionText: 'Define secure home office requirements', priority: 'medium' },
      { actionText: 'Provide security awareness for remote workers', priority: 'medium' }
    ]
  },
  {
    id: 'A.6.8',
    category: 'PEOPLE',
    title: 'Information security event reporting',
    description: 'The organization should provide a mechanism for personnel to report observed or suspected information security events.',
    status: 'partial',
    rating: 50,
    explanation: 'Incident reporting mechanism exists through help desk but not well-publicized. Staff unsure when to report.',
    suggestedActions: [
      { actionText: 'Implement dedicated security incident reporting channel', priority: 'high' },
      { actionText: 'Train staff on what constitutes a reportable event', priority: 'high' },
      { actionText: 'Promote no-blame culture for reporting', priority: 'medium' },
      { actionText: 'Provide feedback on reported incidents', priority: 'medium' }
    ]
  },
  // A.7 - PHYSICAL CONTROLS
  {
    id: 'A.7.1',
    category: 'PHYSICAL',
    title: 'Physical security perimeters',
    description: 'Security perimeters should be defined and used to protect areas that contain information and other associated assets.',
    status: 'compliant',
    rating: 72,
    explanation: 'Server rooms have controlled access with locked doors. Building has security guard and visitor log.',
    suggestedActions: [
      { actionText: 'Install access control system for server room', priority: 'medium' },
      { actionText: 'Implement visitor escort policy for secure areas', priority: 'low' }
    ]
  },
  {
    id: 'A.7.2',
    category: 'PHYSICAL',
    title: 'Physical entry',
    description: 'Secure areas should be protected by appropriate entry controls and access points.',
    status: 'partial',
    rating: 58,
    explanation: 'Basic access controls exist but no audit trail of entries. Keys shared among multiple staff members.',
    suggestedActions: [
      { actionText: 'Implement card-based access control system', priority: 'high' },
      { actionText: 'Enable access logging and audit trail', priority: 'high' },
      { actionText: 'Eliminate shared access credentials', priority: 'medium' }
    ]
  },
  {
    id: 'A.7.4',
    category: 'PHYSICAL',
    title: 'Physical security monitoring',
    description: 'Premises should be continuously monitored for unauthorized physical access.',
    status: 'non-compliant',
    rating: 35,
    explanation: 'No CCTV or automated monitoring in server rooms. Security relies solely on locked doors.',
    suggestedActions: [
      { actionText: 'Install CCTV in server rooms with 30-day retention', priority: 'high' },
      { actionText: 'Implement intrusion detection system', priority: 'medium' },
      { actionText: 'Establish 24/7 monitoring or alert system', priority: 'medium' }
    ]
  },
  {
    id: 'A.7.7',
    category: 'PHYSICAL',
    title: 'Clear desk and clear screen',
    description: 'Clear desk rules for papers and removable storage media and clear screen rules for information processing facilities should be defined and appropriately enforced.',
    status: 'partial',
    rating: 45,
    explanation: 'Clear desk policy exists but enforcement is inconsistent. Staff awareness is low.',
    suggestedActions: [
      { actionText: 'Increase awareness of clear desk policy', priority: 'medium' },
      { actionText: 'Implement periodic compliance checks', priority: 'low' },
      { actionText: 'Provide secure storage for sensitive documents', priority: 'medium' }
    ]
  },
  // A.8 - TECHNOLOGICAL CONTROLS
  {
    id: 'A.8.1',
    category: 'TECHNOLOGICAL',
    title: 'User endpoint devices',
    description: 'Information stored on, processed by or accessible via user endpoint devices should be protected.',
    status: 'partial',
    rating: 60,
    explanation: 'Antivirus deployed on university-owned devices. BYOD devices not managed or secured.',
    suggestedActions: [
      { actionText: 'Implement endpoint protection platform', priority: 'high' },
      { actionText: 'Extend security controls to BYOD devices', priority: 'high' },
      { actionText: 'Enable full disk encryption on laptops', priority: 'high' }
    ]
  },
  {
    id: 'A.8.2',
    category: 'TECHNOLOGICAL',
    title: 'Privileged access rights',
    description: 'The allocation and use of privileged access rights should be restricted and managed.',
    status: 'partial',
    rating: 52,
    explanation: 'Privileged accounts exist but no systematic review. Some administrators have excessive rights.',
    suggestedActions: [
      { actionText: 'Implement privileged access management system', priority: 'high' },
      { actionText: 'Conduct quarterly privileged access reviews', priority: 'high' },
      { actionText: 'Enforce multi-factor authentication for admin accounts', priority: 'high' }
    ]
  },
  {
    id: 'A.8.3',
    category: 'TECHNOLOGICAL',
    title: 'Information access restriction',
    description: 'Access to information and other associated assets should be restricted in accordance with the established topic-specific policy on access control.',
    status: 'partial',
    rating: 55,
    explanation: 'Basic access controls implemented but not aligned with data classification. Access creep observed.',
    suggestedActions: [
      { actionText: 'Align access rights with data classification', priority: 'high' },
      { actionText: 'Implement role-based access control', priority: 'high' },
      { actionText: 'Conduct quarterly access rights reviews', priority: 'medium' }
    ]
  },
  {
    id: 'A.8.5',
    category: 'TECHNOLOGICAL',
    title: 'Secure authentication',
    description: 'Secure authentication technologies and procedures should be implemented based on information access restrictions and the topic-specific policy on access control.',
    status: 'partial',
    rating: 48,
    explanation: 'Password-based authentication used but MFA not widely deployed. Weak password policies.',
    suggestedActions: [
      { actionText: 'Implement multi-factor authentication for all systems', priority: 'high' },
      { actionText: 'Strengthen password complexity requirements', priority: 'high' },
      { actionText: 'Deploy single sign-on solution', priority: 'medium' }
    ]
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  console.log('Creating default user...');
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@novatrix.local' },
    update: {},
    create: {
      email: 'admin@novatrix.local',
      passwordHash: hashedPassword,
      fullName: 'NovaTrix Administrator',
      role: 'admin'
    }
  });
  console.log(`✓ Created user: ${user.email}`);

  // Create sample respondents
  console.log('\nCreating sample respondents...');
  const respondents = [
    {
      name: 'Dr. Ahmad Susanto',
      role: 'Head of IT Security',
      division: 'Directorate of IT (DTI)',
      email: 'ahmad.susanto@ugm.ac.id',
      phone: '0274-123-4567',
      notes: 'Primary contact for security policy matters. Available Mon-Wed.'
    },
    {
      name: 'Ibu Siti Nurhaliza',
      role: 'Data Protection Officer',
      division: 'Directorate of IT (DTI)',
      email: 'siti.nurhaliza@ugm.ac.id',
      phone: '0274-234-5678',
      notes: 'Handles compliance and privacy issues. Prefers email communication.'
    },
    {
      name: 'Bapak Bambang Wijaya',
      role: 'Infrastructure Manager',
      division: 'Directorate of IT (DTI)',
      email: 'bambang.wijaya@ugm.ac.id',
      phone: '0274-345-6789',
      notes: 'Manages physical and cloud infrastructure. Best contacted in the afternoon.'
    }
  ];

  for (const respondent of respondents) {
    const existing = await prisma.respondent.findFirst({
      where: { email: respondent.email }
    });

    if (!existing) {
      await prisma.respondent.create({
        data: respondent
      });
      console.log(`✓ Created respondent: ${respondent.name} - ${respondent.role}`);
    } else {
      console.log(`  Respondent already exists: ${respondent.name}`);
    }
  }

  // Create Annex A controls with suggested actions
  // Create sample questions for question bank
  console.log('\nCreating sample questions...');
  const sampleQuestions = [
    {
      questionText: 'How does your organization manage access control to sensitive information systems?',
      questionCategory: 'Technical',
      targetControls: JSON.stringify(['A.5.15', 'A.8.2', 'A.8.3'])
    },
    {
      questionText: 'What policies and procedures are in place for information security awareness training?',
      questionCategory: 'Policy',
      targetControls: JSON.stringify(['A.6.3'])
    },
    {
      questionText: 'Describe the backup and recovery procedures for critical systems.',
      questionCategory: 'Process',
      targetControls: JSON.stringify(['A.5.30', 'A.8.13'])
    },
    {
      questionText: 'How are security incidents reported and managed within the organization?',
      questionCategory: 'Process',
      targetControls: JSON.stringify(['A.6.8'])
    },
    {
      questionText: 'What measures are in place to ensure physical security of server rooms and data centers?',
      questionCategory: 'Physical',
      targetControls: JSON.stringify(['A.7.1', 'A.7.2', 'A.7.4'])
    }
  ];

  const createdQuestions = [];
  for (const question of sampleQuestions) {
    const created = await prisma.question.create({
      data: {
        ...question,
        createdById: user.id
      }
    });
    createdQuestions.push(created);
    console.log(`✓ Created question: ${question.questionText.substring(0, 50)}...`);
  }

  // Create sample interviews
  console.log('\nCreating sample interviews...');

  // Get the created respondents
  const allRespondents = await prisma.respondent.findMany();

  if (allRespondents.length >= 2) {
    // Interview 1 - with Dr. Ahmad (completed)
    const interview1 = await prisma.interview.create({
      data: {
        respondentId: allRespondents[0].id,
        interviewDate: new Date('2024-11-10'),
        interviewerId: user.id,
        status: 'completed',
        aiSummary: 'The respondent demonstrated strong understanding of security policies and procedures. DTI has established comprehensive documentation for access control and incident management. However, there are gaps in consistent enforcement and staff awareness.',
        aiKeyStatements: JSON.stringify([
          'We have documented security policies that are reviewed quarterly',
          'Multi-factor authentication is being rolled out across critical systems',
          'Security awareness training completion rate is approximately 75%'
        ]),
        aiContradictions: JSON.stringify([
          'Claimed all staff complete training, but records show only 75% completion'
        ]),
        aiMaturityScore: 3.5,
        interviewQA: {
          create: [
            {
              questionId: createdQuestions[0].id,
              questionText: createdQuestions[0].questionText,
              answerText: 'We use role-based access control (RBAC) with regular reviews every 6 months. Multi-factor authentication is implemented for all privileged accounts and we are expanding it to all users by Q1 2025.',
              questionOrder: 1,
              interviewQAControls: {
                create: [
                  { controlId: 'A.8.2' },
                  { controlId: 'A.8.3' }
                ]
              }
            },
            {
              questionId: createdQuestions[1].id,
              questionText: createdQuestions[1].questionText,
              answerText: 'We conduct annual security awareness training for all staff. The training covers phishing, password security, and data handling. Completion rate is tracked but enforcement could be better.',
              questionOrder: 2,
              interviewQAControls: {
                create: [
                  { controlId: 'A.6.3' }
                ]
              }
            },
            {
              questionId: createdQuestions[3].id,
              questionText: createdQuestions[3].questionText,
              answerText: 'We have a help desk ticketing system where incidents can be reported. Major incidents are escalated to the security team. We are working on implementing a dedicated security incident reporting channel.',
              questionOrder: 3,
              interviewQAControls: {
                create: [
                  { controlId: 'A.6.8' }
                ]
              }
            }
          ]
        }
      }
    });
    console.log(`✓ Created interview 1 with ${allRespondents[0].name}`);

    // Interview 2 - with Ibu Siti (scheduled)
    const interview2 = await prisma.interview.create({
      data: {
        respondentId: allRespondents[1].id,
        interviewDate: new Date('2024-12-05'),
        interviewerId: user.id,
        status: 'scheduled',
        interviewQA: {
          create: [
            {
              questionId: createdQuestions[1].id,
              questionText: createdQuestions[1].questionText,
              questionOrder: 1
            },
            {
              questionText: 'What is the process for handling personal data under privacy regulations?',
              questionOrder: 2,
              interviewQAControls: {
                create: [
                  { controlId: 'A.5.1' }
                ]
              }
            },
            {
              questionText: 'How are data protection impact assessments conducted?',
              questionOrder: 3
            }
          ]
        }
      }
    });
    console.log(`✓ Created interview 2 with ${allRespondents[1].name}`);

    // Create activities for the interviews
    await prisma.activity.createMany({
      data: [
        {
          userId: user.id,
          activityType: 'interview_created',
          entityType: 'interviews',
          entityId: interview1.id,
          description: `Created interview with ${allRespondents[0].name}`
        },
        {
          userId: user.id,
          activityType: 'interview_created',
          entityType: 'interviews',
          entityId: interview2.id,
          description: `Created interview with ${allRespondents[1].name}`
        }
      ]
    });
  }

  console.log('\nCreating Annex A controls...');
  for (const control of annexAControls) {
    const { suggestedActions, ...controlData } = control;

    await prisma.annexAControl.upsert({
      where: { id: control.id },
      update: controlData,
      create: {
        ...controlData,
        suggestedActions: {
          create: suggestedActions
        }
      }
    });
    console.log(`✓ Created control: ${control.id} - ${control.title}`);
  }

  console.log(`\n✅ Seed completed successfully!`);
  console.log(`   - 1 user created`);
  console.log(`   - 3 respondents created`);
  console.log(`   - 5 sample questions created`);
  console.log(`   - 2 sample interviews created`);
  console.log(`   - ${annexAControls.length} Annex A controls created`);
  console.log(`\nDefault credentials:`);
  console.log(`   Email: admin@novatrix.local`);
  console.log(`   Password: admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
