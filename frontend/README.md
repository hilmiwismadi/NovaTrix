# NovaTrix - Campus Information Security Management System

NovaTrix is an ISO 27001 compliance management system designed for UGM (Universitas Gadjah Mada) Directorate of IT (DTI). This frontend mockup demonstrates the system's six main modules for thesis presentation purposes.

## Project Overview

- **Purpose**: ISO 27001:2022 Annex A compliance tracking and analysis
- **Focus**: Organizational and People controls (A.5 & A.6)
- **Status**: Frontend mockup with mock data
- **Technology**: Vite + React + Tailwind CSS

## Features

### 1. Main Dashboard - Personal Audit Command Center
- Summary statistics (documents, interviews, controls, compliance score)
- Compliance overview visualization
- Quick action buttons
- Recent activity timeline

### 2. Document Dashboard - Document Analysis Hub
- Document upload interface (UI only)
- Document list with search and filtering
- AI-generated summaries (short, detailed, ISO compliance)
- Annex A control mapping
- Gap analysis for each document
- Document detail modal view

### 3. Interview Dashboard - Qualitative Evidence Collector
- Interview list with maturity scores
- Respondent information display
- Question and answer pairs with Annex A mapping
- AI analysis (summary, key statements, contradictions)
- Maturity scoring (0-5 scale)

### 4. Annex A Control Navigator - ISO 27001 Control Browser
- All 28 controls across 4 categories
- Category filtering (Organizational, People, Physical, Technological)
- Search functionality
- Compliance ratings with progress bars
- Control detail modal with evidence links
- AI-generated explanations and suggested actions

### 5. SOA Generator - AI-Generated Statement of Applicability
- Complete SOA table for all controls
- Implementation status tracking
- Applicability rationale
- Filter by implementation status
- Export functionality (placeholder)

### 6. Gap Analysis - Recommendations Module
- 10 identified compliance gaps
- Priority-based filtering (High, Medium, Low)
- Expandable gap details
- Supporting evidence
- AI recommendations with effort and cost estimates
- Impact assessment

## Design System

### Color Palette
- **Primary Background**: White (#FFFFFF)
- **Accent**: Cyan/Aqua (#00FFFF)
- **Text**: Gray scale (#222, #444, #888)
- **Status Colors**: Green (compliant), Orange (partial), Red (non-compliant)

### Design Principles
- Simple and futuristic (non-sci-fi)
- Clean layout with heavy whitespace
- Minimal noise and high readability
- Engineered components with crisp lines
- 8px grid alignment
- Clean sans-serif typography
- Cyan accent used sparingly

### Branding
- Logo: **Nova_Trix** (cyan underscore accent)
- Typography: Clean sans-serif, intentional spacing
- Professional, forward-looking aesthetic

## Tech Stack

- **Vite**: Fast build tool and dev server
- **React 18**: UI library
- **React Router v6**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **lucide-react**: Icon library

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Navigate to frontend directory
cd NovaTrix/frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

## Demo Presentation Guide

### Recommended Flow (12-15 minutes)

1. **Main Dashboard** (2 min)
   - Show compliance overview (58% average score)
   - Point out 28 controls analyzed, 7 documents, 4 interviews
   - Explain compliance breakdown: 7 compliant, 17 partial, 4 non-compliant

2. **Document Dashboard** (3 min)
   - Navigate to documents
   - Show document list with status badges
   - Click on "UGM Information Security Policy 2024"
   - Demonstrate AI summaries and Annex A mapping
   - Highlight gap analysis feature

3. **Interview Dashboard** (2 min)
   - Show interview list with maturity scores
   - Select an interview to display Q&A pairs
   - Show AI analysis with key statements and contradictions
   - Highlight maturity scoring (0-5 scale)

4. **Control Navigator** (3 min)
   - Filter by category (show Organizational controls)
   - Click on a control (e.g., A.5.1)
   - Show compliance rating, related evidence
   - Demonstrate AI explanation and suggested actions

5. **SOA Generator** (2 min)
   - Show complete SOA table
   - Filter by implementation status
   - Explain auto-generation based on evidence

6. **Gap Analysis** (3 min)
   - Show gap priority distribution
   - Expand a high-priority gap
   - Explain AI recommendations, effort estimates
   - Discuss cost estimates in Rupiah

### Key Talking Points

- **AI-Powered Analysis**: Automated document analysis, interview summary, and gap identification
- **Evidence-Based**: All compliance ratings backed by documents and interviews
- **Campus-Specific**: Tailored for UGM DTI with Indonesian context
- **ISO 27001 Alignment**: Complete Annex A control coverage
- **Focus Areas**: Organizational and People controls (not technical penetration testing)
- **Actionable Insights**: Clear recommendations with effort and cost estimates

## Future Development

This mockup demonstrates the frontend interface. Full implementation would include:

- **Backend API**: Node.js/Python with REST or GraphQL
- **Database**: PostgreSQL/MongoDB for data persistence
- **AI Integration**: OpenAI/Claude API for real analysis
- **Authentication**: User login and role-based access control
- **Real Document Processing**: OCR and text extraction
- **Export Features**: PDF/CSV report generation
- **Real-Time Updates**: WebSocket for live collaboration
- **Cloud Deployment**: AWS/Azure/GCP hosting

## Development Notes

- All data is currently mock/hardcoded
- Upload and export buttons show placeholders
- No backend connectivity
- Optimized for desktop presentation (responsive design included)
- Icons from lucide-react library
- No external UI component libraries used (custom-built following design system)

## Contact

For questions or feedback about this thesis project:
- **Student**: Hilmi
- **Institution**: Universitas Gadjah Mada (UGM)
- **Department**: Information Technology

---

Generated with NovaTrix - ISO 27001 Compliance Management System
