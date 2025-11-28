// Mock Statement of Applicability (SOA) Data

import { annexAControls } from './mockAnnexA';

// Generate SOA entries for all controls
export const soaEntries = annexAControls.map(control => ({
  controlId: control.id,
  controlTitle: control.title,
  applicable: true, // All controls are applicable for this assessment
  rationale: generateRationale(control),
  implementationStatus: mapStatusToImplementation(control.status),
  evidence: [...control.relatedDocs, ...control.relatedInterviews],
  recommendations: control.suggestedActions.join('; '),
  lastUpdated: '2024-11-20',
  category: control.category
}));

function generateRationale(control) {
  const rationales = {
    'A.5.1': 'Campus requires comprehensive security policies to protect student and research data, ensure regulatory compliance, and maintain operational continuity.',
    'A.5.2': 'Clear definition of security roles essential for large university IT organization with multiple departments and distributed responsibilities.',
    'A.5.3': 'Segregation of duties necessary to prevent conflicts of interest and reduce risk of fraud or errors in system administration.',
    'A.5.7': 'Understanding current threat landscape critical for defending against attacks targeting educational institutions.',
    'A.5.8': 'Integration of security into projects ensures protection is built-in rather than added as afterthought.',
    'A.5.9': 'Asset inventory required to understand what information and systems need protection and who is responsible.',
    'A.5.10': 'Acceptable use policy necessary to establish boundaries for appropriate use of university IT resources.',
    'A.5.13': 'Information labelling enables appropriate handling based on sensitivity and confidentiality requirements.',
    'A.5.14': 'Information transfer controls protect data in transit between systems and external parties.',
    'A.5.23': 'Cloud security governance essential as university increasingly relies on cloud services for operations.',
    'A.5.29': 'Security must be maintained even during disruptions to protect critical data and systems.',
    'A.5.30': 'ICT continuity ensures ability to deliver essential services during and after disruptions.',
    'A.6.1': 'Pre-employment screening reduces risk of hiring individuals with undisclosed conflicts or problematic backgrounds.',
    'A.6.2': 'Contractual security responsibilities clarify expectations and provide basis for accountability.',
    'A.6.3': 'Security awareness training critical to address human factor as primary security weakness.',
    'A.6.4': 'Disciplinary process deters policy violations and demonstrates consequences of security breaches.',
    'A.6.5': 'Post-employment obligations ensure departing staff continue to protect university information.',
    'A.6.6': 'NDAs protect confidential information shared with employees, contractors, and partners.',
    'A.6.7': 'Remote working security essential as work-from-home and flexible arrangements increase.',
    'A.6.8': 'Event reporting mechanism enables timely detection and response to security incidents.',
    'A.7.1': 'Physical perimeters protect critical IT infrastructure from unauthorized physical access.',
    'A.7.2': 'Entry controls verify authorization and create accountability for physical access.',
    'A.7.4': 'Physical monitoring detects and deters unauthorized access attempts to sensitive areas.',
    'A.7.7': 'Clear desk policy prevents information disclosure through unattended documents and screens.',
    'A.8.1': 'Endpoint security protects university data accessed from diverse personal and university devices.',
    'A.8.2': 'Privileged access management prevents excessive rights that could lead to abuse or compromise.',
    'A.8.3': 'Access restrictions ensure staff only access information necessary for their roles.',
    'A.8.5': 'Strong authentication prevents unauthorized access to university systems and data.'
  };

  return rationales[control.id] || `This control is applicable to maintain security posture aligned with university requirements and ISO 27001 standards.`;
}

function mapStatusToImplementation(status) {
  const mapping = {
    'compliant': 'Implemented',
    'partial': 'Partially Implemented',
    'non-compliant': 'Not Implemented'
  };
  return mapping[status] || 'Not Assessed';
}

export const getSOAByControlId = (controlId) => {
  return soaEntries.find(soa => soa.controlId === controlId);
};

export const getSOAByCategory = (category) => {
  return soaEntries.filter(soa => soa.category === category);
};

export const getSOAByStatus = (status) => {
  return soaEntries.filter(soa => soa.implementationStatus === status);
};
