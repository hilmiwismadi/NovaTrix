# Interview Feature - Complete Implementation Guide

**Last Updated:** 2025-11-28
**Status:** ✅ Fully Implemented
**Route:** `/interviews`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Design Decisions](#architecture--design-decisions)
3. [Database Schema](#database-schema)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Data Flow](#data-flow)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Testing & Validation](#testing--validation)
9. [Future Development](#future-development)

---

## Overview

### Purpose
The Interview feature allows auditors to prepare, conduct, and manage interviews with respondents as part of ISO 27001 compliance assessment. Auditors can prepare questions before meetings, map questions to Annex A controls, record answers, and track interview progress.

### Key Features
- ✅ Create new interviews with respondent data
- ✅ Select respondents from existing database or create new ones
- ✅ Add questions from question bank or create custom questions
- ✅ Map interview questions to Annex A controls (ISO 27001:2022)
- ✅ Record answers during/after interviews
- ✅ Edit respondent information, questions, and answers
- ✅ Delete interviews with cascade deletion
- ✅ View interview history and details
- ✅ AI analysis support (summary, key statements, contradictions, maturity score)
- ✅ Activity logging for audit trail

### User Workflow
1. **Prepare**: Auditor creates interview, selects/creates respondent, adds questions
2. **Map**: Optionally map questions to relevant ISO 27001 controls
3. **Conduct**: During meeting, auditor records answers (can be done via Edit)
4. **Review**: View interview details, Q&A, and mapped controls
5. **Analyze**: System provides AI-generated insights (future feature)

---

## Architecture & Design Decisions

### 1. Multi-Step Wizard Pattern
**Decision:** Use 3-step wizard for both Add and Edit forms
**Rationale:**
- Reduces cognitive load by breaking complex form into manageable sections
- Allows validation at each step before proceeding
- Matches existing DocumentUploadForm pattern for consistency

**Steps:**
1. **Respondent Information** - Select existing or create new respondent
2. **Questions & Answers** - Add from bank or custom, map to controls
3. **Review** - Final review before submission

### 2. Question Bank System
**Decision:** Maintain separate Question table with reusable questions
**Rationale:**
- Questions can be prepared in advance and reused across interviews
- Auditors can build a library of effective questions over time
- Supports both bank questions (questionId) and ad-hoc questions (questionId = null)

### 3. Flexible Control Mapping
**Decision:** Many-to-many relationship between Q&A and Controls
**Rationale:**
- One question can relate to multiple controls
- Enables comprehensive evidence linking for compliance reporting
- Follows same pattern as Annotation-Control mapping

### 4. Transaction-Based Updates
**Decision:** Use Prisma transactions for all create/update operations
**Rationale:**
- Ensures atomic operations - all changes succeed or all fail
- Maintains data integrity when creating/updating related records
- Prevents partial updates that could corrupt data

### 5. Optional Answer Recording
**Decision:** Allow interviews to be created without answers
**Rationale:**
- Supports preparation workflow (questions prepared before meeting)
- Answers filled during or after interview via Edit
- Status field tracks interview state: scheduled → completed → analyzed

---

## Database Schema

### Tables Involved

#### 1. **Respondent** (`respondents`)
```prisma
model Respondent {
  id        Int      @id @default(autoincrement())
  name      String   // Required
  role      String   // Required (e.g., "IT Security Manager")
  division  String?  // Optional (e.g., "Directorate of IT")
  email     String?  // Optional
  phone     String?  // Optional
  notes     String?  // Optional notes about respondent
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  interviews Interview[]
}
```

#### 2. **Interview** (`interviews`)
```prisma
model Interview {
  id                 Int      @id @default(autoincrement())
  respondentId       Int      // FK to Respondent
  interviewDate      DateTime
  interviewerId      Int?     // FK to User (optional)
  status             String   @default("scheduled") // scheduled, completed, analyzed
  aiSummary          String?  // AI-generated summary
  aiKeyStatements    String?  // JSON array of key statements
  aiContradictions   String?  // JSON array of contradictions found
  aiMaturityScore    Float?   // 0.0 to 5.0
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  // Relations
  respondent  Respondent    @relation(fields: [respondentId], references: [id], onDelete: Cascade)
  interviewer User?         @relation("interviewer", fields: [interviewerId], references: [id], onDelete: SetNull)
  interviewQA InterviewQA[]
}
```

**Key Points:**
- `respondentId`: Required foreign key with CASCADE delete (deleting respondent deletes all interviews)
- `interviewerId`: Optional, tracks which auditor conducted the interview
- `status`: Tracks progression (scheduled → completed → analyzed)
- AI fields: Reserved for future AI analysis feature

#### 3. **Question** (`questions`)
```prisma
model Question {
  id               Int      @id @default(autoincrement())
  questionText     String
  questionCategory String?  // e.g., "Policy", "Technical", "Process"
  targetControls   String?  // JSON array: ["A.5.1", "A.6.3"]
  createdById      Int?     // FK to User
  createdAt        DateTime @default(now())

  // Relations
  createdBy   User?         @relation(fields: [createdById], references: [id], onDelete: SetNull)
  interviewQA InterviewQA[]
}
```

**Key Points:**
- Question bank that can be reused across interviews
- `targetControls`: Pre-mapped controls stored as JSON
- Questions can be linked to interviews via InterviewQA

#### 4. **InterviewQA** (`interview_qa`)
```prisma
model InterviewQA {
  id            Int      @id @default(autoincrement())
  interviewId   Int      // FK to Interview
  questionId    Int?     // FK to Question (NULL if custom/ad-hoc)
  questionText  String   // Actual question text (copied from Question or custom)
  answerText    String?  // Answer recorded during interview (optional)
  questionOrder Int      @default(0)
  createdAt     DateTime @default(now())

  // Relations
  interview            Interview            @relation(fields: [interviewId], references: [id], onDelete: Cascade)
  question             Question?            @relation(fields: [questionId], references: [id], onDelete: SetNull)
  interviewQAControls  InterviewQAControl[]
}
```

**Key Points:**
- Links specific questions to interviews
- `questionId`: NULL for custom questions, set for bank questions
- `questionText`: Always stored (even if from bank) to preserve historical data
- `answerText`: NULL until recorded (supports preparation workflow)
- `questionOrder`: Maintains question sequence

#### 5. **InterviewQAControl** (`interview_qa_controls`)
```prisma
model InterviewQAControl {
  id        Int      @id @default(autoincrement())
  qaId      Int      // FK to InterviewQA
  controlId String   // FK to AnnexAControl
  createdAt DateTime @default(now())

  // Relations
  qa      InterviewQA   @relation(fields: [qaId], references: [id], onDelete: Cascade)
  control AnnexAControl @relation(fields: [controlId], references: [id], onDelete: Cascade)

  @@unique([qaId, controlId]) // Prevent duplicate mappings
}
```

**Key Points:**
- Junction table for many-to-many relationship
- One Q&A can map to multiple controls
- Unique constraint prevents duplicate mappings
- CASCADE delete: Deleting Q&A removes mappings

#### 6. **AnnexAControl** (`annex_a_controls`)
```prisma
model AnnexAControl {
  id          String   @id // A.5.1, A.6.3, etc.
  category    String   // ORGANIZATIONAL, PEOPLE, PHYSICAL, TECHNOLOGICAL
  title       String   // Control title
  description String
  // ... other fields

  // Relations
  interviewQAControls  InterviewQAControl[]
}
```

**⚠️ CRITICAL:** Field names are `title` and `category`, **NOT** `controlTitle` and `controlCategory`
See [Common Issues](#common-issues--solutions) for details.

### Relationship Diagram
```
User (Auditor)
  └─ 1:N → Interview
              ├─ N:1 → Respondent
              └─ 1:N → InterviewQA
                          ├─ N:1 → Question (optional)
                          └─ N:M → AnnexAControl (via InterviewQAControl)
```

---

## Backend Implementation

### File Structure
```
backend/src/
├── controllers/
│   └── interviewsController.js    # All interview business logic
├── routes/
│   └── interviews.routes.js        # API endpoints
└── server.js                       # Route registration
```

### API Endpoints

#### **GET /api/interviews**
Fetch all interviews with basic info

**Query Parameters:**
- `status` (optional): Filter by status (scheduled, completed, analyzed)

**Response:**
```json
{
  "interviews": [
    {
      "id": 1,
      "interviewDate": "2025-01-15T00:00:00Z",
      "status": "scheduled",
      "aiMaturityScore": null,
      "respondent": {
        "id": 1,
        "name": "Dr. Ahmad Susanto",
        "role": "Head of IT Security",
        "division": "Directorate of IT"
      },
      "interviewer": {
        "id": 1,
        "fullName": "Admin User",
        "email": "admin@novatrix.com"
      },
      "_count": {
        "interviewQA": 5
      }
    }
  ],
  "total": 1
}
```

**Includes:**
- Respondent basic info
- Interviewer info
- Question count (via `_count`)

---

#### **GET /api/interviews/:id**
Fetch single interview with full details (Q&A, controls, answers)

**Response:**
```json
{
  "interview": {
    "id": 1,
    "interviewDate": "2025-01-15T00:00:00Z",
    "status": "scheduled",
    "aiSummary": null,
    "aiKeyStatements": null,
    "aiContradictions": null,
    "aiMaturityScore": null,
    "respondent": {
      "id": 1,
      "name": "Dr. Ahmad Susanto",
      "role": "Head of IT Security",
      "division": "Directorate of IT",
      "email": "ahmad.susanto@ugm.ac.id",
      "phone": "0274-123-4567",
      "notes": null
    },
    "interviewer": {
      "id": 1,
      "fullName": "Admin User",
      "email": "admin@novatrix.com"
    },
    "interviewQA": [
      {
        "id": 1,
        "questionId": 1,
        "questionText": "Can you describe your organization's current information security policy?",
        "answerText": "We have a comprehensive policy...",
        "questionOrder": 1,
        "question": {
          "id": 1,
          "questionText": "Can you describe your organization's current information security policy?",
          "questionCategory": "Policy"
        },
        "interviewQAControls": [
          {
            "id": 1,
            "control": {
              "id": "A.5.1",
              "title": "Policies for information security",
              "category": "ORGANIZATIONAL"
            }
          }
        ]
      }
    ]
  }
}
```

**Includes:**
- Full respondent details
- Interviewer info
- All Q&A records with:
  - Question bank reference (if applicable)
  - Answer text
  - Mapped controls with full details

**Use Case:** Called when clicking Edit button to populate form

---

#### **POST /api/interviews**
Create new interview

**Request Body:**
```json
{
  "respondentId": 1,              // Option 1: Use existing respondent
  "newRespondent": {              // Option 2: Create new respondent
    "name": "John Doe",
    "role": "IT Manager",
    "division": "IT Department",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "notes": "Available on Tuesdays"
  },
  "interviewDate": "2025-01-20",
  "questions": [
    {
      "questionId": 1,            // From question bank
      "questionText": "What is your security policy?",
      "answerText": "",           // Optional, can be empty
      "controls": ["A.5.1", "A.5.2"]
    },
    {
      "questionId": null,         // Custom question
      "questionText": "How many employees?",
      "answerText": "",
      "controls": []
    }
  ]
}
```

**Validation:**
- Either `respondentId` OR `newRespondent` must be provided
- If `newRespondent`, `name` and `role` are required
- `interviewDate` is required
- `questions` array must have at least 1 question
- All questions must have non-empty `questionText`

**Transaction Steps:**
1. Create/verify respondent
2. Create interview record
3. Create InterviewQA records with proper order
4. Create control mappings (if provided)
5. Verify all referenced questions and controls exist
6. Log activity
7. Fetch and return complete interview data

**Error Handling:**
- `400` - Validation error (missing required fields)
- `404` - Referenced respondent/question/control not found
- `500` - Database error

**Response:**
```json
{
  "message": "Interview created successfully",
  "interview": { /* Full interview object */ }
}
```

---

#### **PUT /api/interviews/:id**
Update interview (respondent, date, status, questions, answers)

**Request Body:**
```json
{
  "respondentData": {
    "name": "Dr. Ahmad Susanto",
    "role": "Head of IT Security",
    "division": "Directorate of IT (DTI)",
    "email": "ahmad.susanto@ugm.ac.id",
    "phone": "0274-123-4567",
    "notes": "Prefers morning meetings"
  },
  "interviewDate": "2025-01-15",
  "status": "completed",
  "questions": [
    {
      "questionId": 1,
      "questionText": "Updated question text",
      "answerText": "Recorded answer",
      "controls": ["A.5.1"]
    }
  ]
}
```

**All fields are optional** - only send what needs to be updated

**Transaction Steps:**
1. Verify interview exists
2. Update respondent data (if provided)
3. **Delete ALL existing Q&A records** (if questions provided)
4. Create new Q&A records with updated data
5. Create control mappings
6. Update interview fields (date, status)
7. Log activity
8. Return updated interview

**⚠️ Important:** Questions are replaced entirely, not merged. Always send complete question list.

**Response:**
```json
{
  "message": "Interview updated successfully",
  "interview": { /* Full interview object */ }
}
```

---

#### **DELETE /api/interviews/:id**
Delete interview

**Response:**
```json
{
  "message": "Interview deleted successfully"
}
```

**Cascade Behavior:**
- Deletes all InterviewQA records (via CASCADE)
- Deletes all InterviewQAControl mappings (via CASCADE on InterviewQA)
- Does NOT delete respondent (allows historical data)
- Logs deletion activity

---

#### **GET /api/interviews/respondents/all**
Fetch all respondents for dropdown selection

**Response:**
```json
{
  "respondents": [
    {
      "id": 1,
      "name": "Dr. Ahmad Susanto",
      "role": "Head of IT Security",
      "division": "Directorate of IT",
      "email": "ahmad.susanto@ugm.ac.id",
      "phone": "0274-123-4567"
    }
  ],
  "total": 1
}
```

**Ordering:** Alphabetical by name

---

#### **GET /api/interviews/questions/bank**
Fetch question bank

**Query Parameters:**
- `category` (optional): Filter by question category

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "questionText": "Can you describe your organization's current information security policy?",
      "questionCategory": "Policy",
      "targetControls": "[\"A.5.1\", \"A.5.2\"]",
      "createdBy": {
        "id": 1,
        "fullName": "Admin User"
      }
    }
  ],
  "total": 1
}
```

**Ordering:** Most recent first (createdAt DESC)

---

### Controller Functions

**File:** `backend/src/controllers/interviewsController.js`

#### **getInterviews**
```javascript
export const getInterviews = async (req, res) => {
  // Supports filtering by status
  // Returns list with respondent, interviewer, and Q&A count
  // Used by InterviewDashboard to show all interviews
}
```

#### **getInterviewById**
```javascript
export const getInterviewById = async (req, res) => {
  // Fetches complete interview data
  // Includes all Q&A, controls, and respondent details
  // Used by Edit form to populate initial data
  // ⚠️ CRITICAL: Uses correct field names (title, category, NOT controlTitle, controlCategory)
}
```

#### **createInterview**
```javascript
export const createInterview = async (req, res) => {
  // Uses Prisma transaction for atomic creation
  // Creates respondent if needed
  // Creates interview + Q&A + control mappings
  // Validates all foreign keys before creating
  // Logs activity
}
```

#### **updateInterview**
```javascript
export const updateInterview = async (req, res) => {
  // Uses Prisma transaction
  // Updates respondent data in place
  // REPLACES all Q&A records (delete + create)
  // Updates interview fields
  // ⚠️ IMPORTANT: Questions are not merged, they're replaced
}
```

#### **deleteInterview**
```javascript
export const deleteInterview = async (req, res) => {
  // Deletes interview (cascade handles Q&A and controls)
  // Logs activity
  // Does NOT delete respondent
}
```

#### **getRespondents**
```javascript
export const getRespondents = async (req, res) => {
  // Simple fetch all respondents
  // Used by Add/Edit forms for dropdown
}
```

#### **getQuestionBank**
```javascript
export const getQuestionBank = async (req, res) => {
  // Fetch questions with optional category filter
  // Used by QuestionBankPicker modal
}
```

---

## Frontend Implementation

### File Structure
```
frontend/src/
├── pages/
│   └── InterviewDashboard.jsx         # Main dashboard page
├── components/
│   ├── common/
│   │   ├── Textarea.jsx               # Reusable textarea component
│   │   ├── Select.jsx                 # Dropdown with custom styling
│   │   └── StepIndicator.jsx          # Multi-step wizard progress
│   └── interviews/
│       ├── AddInterviewForm.jsx       # 3-step wizard for creating
│       ├── EditInterviewForm.jsx      # 3-step wizard for editing
│       ├── QuestionList.jsx           # Display/edit Q&A list
│       ├── QuestionBankPicker.jsx     # Modal to select from bank
│       └── RespondentFormSection.jsx  # Respondent form fields
└── stores/
    └── interviewStore.js              # Zustand state management
```

### State Management

**File:** `frontend/src/stores/interviewStore.js`

**Zustand Store Pattern:**
```javascript
const useInterviewStore = create((set, get) => ({
  // State
  interviews: [],           // List of all interviews
  currentInterview: null,   // Currently selected interview
  respondents: [],          // List of respondents
  questionBank: [],         // List of questions from bank
  isLoading: false,         // Loading indicator
  error: null,              // Error message

  // Actions
  fetchInterviews: async (filters = {}) => { /* ... */ },
  fetchInterviewById: async (id) => { /* ... */ },
  createInterview: async (interviewData) => { /* ... */ },
  updateInterview: async (id, updateData) => { /* ... */ },
  deleteInterview: async (id) => { /* ... */ },
  fetchRespondents: async () => { /* ... */ },
  fetchQuestionBank: async (category = null) => { /* ... */ },
  clearCurrentInterview: () => { /* ... */ },
  clearError: () => { /* ... */ }
}));
```

**Usage Pattern:**
```javascript
import useInterviewStore from '../stores/interviewStore';

function MyComponent() {
  const { interviews, isLoading, fetchInterviews } = useInterviewStore();

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // ...
}
```

**Return Format:**
All async actions return:
```javascript
{ success: true, data: {...} }  // On success
{ success: false, error: "..." } // On failure
```

---

### Component Details

#### **InterviewDashboard.jsx**

**Location:** `frontend/src/pages/InterviewDashboard.jsx`

**Purpose:** Main dashboard showing interview list and details

**Features:**
- List all interviews with respondent info and maturity score
- Click to view interview details
- Add new interview button
- Edit and Delete buttons for selected interview
- Display Q&A with mapped controls
- Show AI analysis (if available)

**State Management:**
```javascript
const { interviews, isLoading, deleteInterview, fetchInterviews, fetchInterviewById } = useInterviewStore();
const [selectedInterview, setSelectedInterview] = useState(null);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [interviewToDelete, setInterviewToDelete] = useState(null);
const [interviewToEdit, setInterviewToEdit] = useState(null);
```

**Edit Handler:**
```javascript
const handleEditClick = async (interview) => {
  // Fetch full interview details including Q&A
  const result = await fetchInterviewById(interview.id);
  if (result.success) {
    setInterviewToEdit(result.data);
    setIsEditModalOpen(true);
  }
};
```

**⚠️ Important:** Must fetch full interview data before editing (list view doesn't include Q&A)

**Delete Handler:**
```javascript
const handleDeleteConfirm = async () => {
  if (interviewToDelete) {
    const result = await deleteInterview(interviewToDelete.id);
    if (result.success) {
      setIsDeleteModalOpen(false);
      setInterviewToDelete(null);
      // If deleted interview was selected, select the first one
      if (selectedInterview?.id === interviewToDelete.id) {
        setSelectedInterview(interviews.length > 1 ? interviews[0] : null);
      }
    }
  }
};
```

**Data Display:**
- Respondent info grid
- Q&A list with control badges
- AI analysis section (summary, key statements, contradictions, maturity score)

---

#### **AddInterviewForm.jsx**

**Location:** `frontend/src/components/interviews/AddInterviewForm.jsx`

**Purpose:** 3-step wizard for creating new interview

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void
}
```

**Form State:**
```javascript
const [formData, setFormData] = useState({
  useExistingRespondent: true,
  respondentId: '',
  newRespondent: {
    name: '',
    role: '',
    division: '',
    email: '',
    phone: '',
    notes: ''
  },
  interviewDate: '',
  questions: []
});
```

**Steps:**

1. **Step 1: Respondent Information**
   - Toggle: "Select Existing" vs "Create New"
   - If existing: Dropdown of respondents
   - If new: Full form fields
   - Interview date picker
   - Validation: name, role, interviewDate required

2. **Step 2: Questions**
   - "Add from Bank" button → Opens QuestionBankPicker
   - "Add Custom Question" button → Adds blank question
   - QuestionList component for display/edit
   - Each question can be mapped to controls
   - Validation: At least 1 question required

3. **Step 3: Review**
   - Read-only summary of all data
   - "Edit" buttons to go back to specific steps
   - Submit button

**Submission:**
```javascript
const handleSubmit = async () => {
  const payload = {
    respondentId: formData.useExistingRespondent ? formData.respondentId : null,
    newRespondent: !formData.useExistingRespondent ? formData.newRespondent : null,
    interviewDate: formData.interviewDate,
    questions: formData.questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      answerText: q.answerText || '',
      controls: q.controls || []
    }))
  };

  const result = await createInterview(payload);
  if (result.success) {
    onSuccess();
    handleClose();
  }
};
```

---

#### **EditInterviewForm.jsx**

**Location:** `frontend/src/components/interviews/EditInterviewForm.jsx`

**Purpose:** 3-step wizard for editing interview (comprehensive)

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSuccess: () => void,
  interview: object  // Full interview object from fetchInterviewById
}
```

**Form State:**
```javascript
const [formData, setFormData] = useState({
  respondentData: {
    name: '',
    role: '',
    division: '',
    email: '',
    phone: '',
    notes: ''
  },
  interviewDate: '',
  status: 'scheduled',
  questions: []
});
```

**Initialization:**
```javascript
useEffect(() => {
  if (interview && isOpen) {
    setFormData({
      respondentData: {
        name: interview.respondent.name || '',
        role: interview.respondent.role || '',
        division: interview.respondent.division || '',
        email: interview.respondent.email || '',
        phone: interview.respondent.phone || '',
        notes: interview.respondent.notes || ''
      },
      interviewDate: new Date(interview.interviewDate).toISOString().split('T')[0],
      status: interview.status || 'scheduled',
      questions: interview.interviewQA?.map(qa => ({
        questionId: qa.questionId,
        questionText: qa.questionText,
        answerText: qa.answerText || '',
        controls: qa.interviewQAControls?.map(qac => qac.control.id) || []
      })) || []
    });
  }
}, [interview, isOpen]);
```

**Steps:**

1. **Step 1: Respondent Information**
   - Edit all respondent fields
   - Edit interview date
   - Change status (scheduled, completed, analyzed)
   - Validation: name, role, interviewDate required

2. **Step 2: Questions & Answers**
   - Display existing questions with ANSWER fields
   - Add new questions from bank or custom
   - Edit question text
   - Edit answer text
   - Reorder questions
   - Delete questions
   - Map/unmap controls
   - Validation: At least 1 question required

3. **Step 3: Review**
   - Summary of all changes
   - Edit buttons to go back

**Submission:**
```javascript
const handleSubmit = async () => {
  const updateData = {
    respondentData: formData.respondentData,
    interviewDate: formData.interviewDate,
    status: formData.status,
    questions: formData.questions
  };

  const result = await updateInterview(interview.id, updateData);
  if (result.success) {
    onSuccess();
    handleClose();
  }
};
```

**Success Handler in Dashboard:**
```javascript
const handleEditSuccess = () => {
  fetchInterviews();  // Refresh list
  if (selectedInterview) {
    fetchInterviewById(selectedInterview.id).then(result => {
      if (result.success) {
        setSelectedInterview(result.data);  // Refresh details
      }
    });
  }
};
```

---

#### **QuestionList.jsx**

**Location:** `frontend/src/components/interviews/QuestionList.jsx`

**Purpose:** Display and edit list of questions with controls

**Props:**
```javascript
{
  questions: array,              // Array of question objects
  onUpdate: (index, updated) => void,
  onDelete: (index) => void,
  onReorder: (index, direction) => void,
  showControls: boolean          // Whether to show control mapping UI
}
```

**Question Object Format:**
```javascript
{
  questionId: number | null,     // NULL for custom questions
  questionText: string,
  answerText: string,            // Optional (only in Edit mode)
  controls: string[]             // Array of control IDs
}
```

**Features:**
- Click question text to edit inline
- Edit answer text (if `answerText` field exists)
- Up/Down buttons to reorder
- Delete button
- Display mapped control badges with remove (X)
- "Map to Control" button → Opens control picker modal

**Control Mapping:**
```javascript
const handleAddControl = (questionIndex, controlId) => {
  const question = questions[questionIndex];
  const currentControls = question.controls || [];

  if (!currentControls.includes(controlId)) {
    onUpdate(questionIndex, {
      ...question,
      controls: [...currentControls, controlId]
    });
  }
  setShowControlPicker(null);
};

const handleRemoveControl = (questionIndex, controlId) => {
  const question = questions[questionIndex];
  onUpdate(questionIndex, {
    ...question,
    controls: question.controls.filter(id => id !== controlId)
  });
};
```

**Control Picker Modal:**
- Search controls by ID or title
- Display control ID, title, category
- Show "Linked" badge for already mapped controls
- Click to add control

**⚠️ CRITICAL:** Uses correct field names:
```javascript
// CORRECT:
control.title       // NOT control.controlTitle
control.category    // NOT control.controlCategory

// Search filter:
control.id.toLowerCase().includes(query) ||
control.title.toLowerCase().includes(query)
```

---

#### **QuestionBankPicker.jsx**

**Location:** `frontend/src/components/interviews/QuestionBankPicker.jsx`

**Purpose:** Modal to select questions from question bank

**Props:**
```javascript
{
  isOpen: boolean,
  onClose: () => void,
  onSelect: (selectedQuestions) => void,
  selectedQuestionIds: number[]  // Already selected question IDs (to disable)
}
```

**Features:**
- Search questions by text or category
- Multi-select with checkboxes
- Show question category badge
- Disable already selected questions
- "Add Selected" button

**State:**
```javascript
const [selectedQuestions, setSelectedQuestions] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
```

**Selection Handler:**
```javascript
const handleToggleQuestion = (question) => {
  setSelectedQuestions(prev => {
    const exists = prev.find(q => q.id === question.id);
    if (exists) {
      return prev.filter(q => q.id !== question.id);
    } else {
      return [...prev, question];
    }
  });
};
```

**Submit:**
```javascript
const handleSubmit = () => {
  onSelect(selectedQuestions);
  setSelectedQuestions([]);
  setSearchQuery('');
  onClose();
};
```

---

#### **RespondentFormSection.jsx**

**Location:** `frontend/src/components/interviews/RespondentFormSection.jsx`

**Purpose:** Reusable respondent form fields

**Props:**
```javascript
{
  useExisting: boolean,
  respondentId: string,
  newRespondent: object,
  respondents: array,
  onToggleMode: () => void,
  onRespondentIdChange: (id) => void,
  onNewRespondentChange: (field, value) => void,
  errors: object
}
```

**Layout:**
- Toggle buttons: "Select Existing" | "Create New"
- If existing: Dropdown with respondent list
- If new: Form with all fields (name*, role*, division, email, phone, notes)

---

#### **Common Components**

##### **Textarea.jsx**
```javascript
export default function Textarea({
  placeholder = '',
  value,
  onChange,
  disabled = false,
  rows = 4,
  name = '',
  required = false,
  className = ''
}) {
  // Styled textarea matching Input component
  // Neumorphic design, focus states
}
```

##### **Select.jsx**
```javascript
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  name = '',
  required = false
}) {
  // Custom dropdown with ChevronDown icon
  // options format: [{ value: 'val', label: 'Label' }]
}
```

##### **StepIndicator.jsx**
```javascript
export default function StepIndicator({
  steps = [],       // Array of step names
  currentStep = 1   // 1-based index
}) {
  // Shows step progress with checkmarks, numbers, connecting lines
  // Past steps: green checkmark
  // Current step: cyan highlight
  // Future steps: gray
}
```

---

## Data Flow

### Create Interview Flow

```
1. User clicks "Add New Interview"
   ↓
2. AddInterviewForm opens (Step 1)
   ↓
3. User selects/creates respondent, sets date
   ↓
4. Click "Next" → Validation → Step 2
   ↓
5. User clicks "Add from Bank"
   ↓
6. QuestionBankPicker opens
   ├─ fetchQuestionBank() called
   ├─ User searches and selects questions
   └─ onSelect() → Questions added to form
   ↓
7. User edits questions, maps controls
   ├─ QuestionList rendered
   ├─ User clicks "Map to Control"
   ├─ Control picker modal opens
   ├─ fetchControls() called
   └─ User selects control → Added to question
   ↓
8. Click "Next" → Validation → Step 3
   ↓
9. Review all data
   ↓
10. Click "Create Interview"
    ↓
11. createInterview() called
    ├─ POST /api/interviews
    ├─ Backend transaction:
    │   ├─ Create/verify respondent
    │   ├─ Create interview
    │   ├─ Create InterviewQA records
    │   ├─ Create InterviewQAControl records
    │   └─ Log activity
    ├─ Response: { success: true, data: interview }
    └─ Store updates: interviews = [newInterview, ...interviews]
    ↓
12. onSuccess() called
    ├─ Modal closes
    └─ fetchInterviews() → Refresh list
    ↓
13. New interview appears in dashboard
```

### Edit Interview Flow

```
1. User clicks "Edit" button on interview
   ↓
2. handleEditClick() called
   ├─ fetchInterviewById(interview.id)
   ├─ GET /api/interviews/:id
   ├─ Response: Full interview with Q&A, controls
   └─ setInterviewToEdit(data)
   ↓
3. EditInterviewForm opens with data
   ├─ useEffect runs
   └─ Form state initialized from interview object
   ↓
4. Step 1: User edits respondent data, date, status
   ↓
5. Click "Next" → Step 2
   ↓
6. User edits questions AND answers
   ├─ Can add new questions from bank
   ├─ Can add custom questions
   ├─ Can edit question text
   ├─ Can edit answer text
   ├─ Can reorder questions
   ├─ Can delete questions
   └─ Can map/unmap controls
   ↓
7. Click "Next" → Step 3 (Review)
   ↓
8. Click "Save Changes"
   ↓
9. updateInterview(id, formData) called
   ├─ PUT /api/interviews/:id
   ├─ Backend transaction:
   │   ├─ Update respondent data
   │   ├─ DELETE all InterviewQA
   │   ├─ CREATE new InterviewQA records
   │   ├─ CREATE new control mappings
   │   ├─ Update interview (date, status)
   │   └─ Log activity
   ├─ Response: { success: true, data: updatedInterview }
   └─ Store updates: Replace interview in list
   ↓
10. handleEditSuccess() called
    ├─ fetchInterviews() → Refresh list
    ├─ fetchInterviewById(selectedInterview.id) → Refresh details
    └─ Modal closes
    ↓
11. Updated interview displayed in dashboard
```

### Delete Interview Flow

```
1. User clicks "Delete" button
   ↓
2. handleDeleteClick() called
   ├─ setInterviewToDelete(interview)
   └─ setIsDeleteModalOpen(true)
   ↓
3. Confirmation modal appears
   ↓
4. User clicks "Delete" (confirm)
   ↓
5. handleDeleteConfirm() called
   ├─ deleteInterview(interview.id)
   ├─ DELETE /api/interviews/:id
   ├─ Backend:
   │   ├─ Delete interview (CASCADE deletes Q&A and controls)
   │   └─ Log activity
   ├─ Response: { success: true }
   └─ Store updates: Filter out deleted interview
   ↓
6. If deleted interview was selected:
   ├─ Select first remaining interview
   └─ Or set selectedInterview = null
   ↓
7. Modal closes
   ↓
8. Interview list updates
```

---

## Common Issues & Solutions

### Issue 1: ❌ 500 Error on GET /api/interviews/:id

**Symptom:**
```
GET http://localhost:5000/api/interviews/2 500 (Internal Server Error)
```

**Root Cause:**
Incorrect field names in Prisma query. The AnnexAControl schema defines fields as `title` and `category`, but code was using `controlTitle` and `controlCategory`.

**Error in Controller:**
```javascript
// ❌ WRONG:
control: {
  select: {
    id: true,
    controlTitle: true,      // Field doesn't exist
    controlCategory: true    // Field doesn't exist
  }
}
```

**Correct Code:**
```javascript
// ✅ CORRECT:
control: {
  select: {
    id: true,
    title: true,       // Correct field name
    category: true     // Correct field name
  }
}
```

**Files Fixed:**
1. `backend/src/controllers/interviewsController.js` - 3 occurrences
   - getInterviewById (line ~100)
   - createInterview (line ~314)
   - updateInterview (line ~531)

2. `frontend/src/components/interviews/QuestionList.jsx` - 3 occurrences
   - Search filter (line ~28)
   - Display title (line ~253)
   - Display category (line ~256)

**How to Verify:**
1. Check Prisma schema: `backend/prisma/schema.prisma`
2. Look at AnnexAControl model
3. Confirm field names: `title`, `category`, NOT `controlTitle`, `controlCategory`

**Prevention:**
- Always reference the Prisma schema when writing queries
- Use TypeScript for better type safety (future improvement)

---

### Issue 2: ❌ Empty Interview List After Implementation

**Symptom:**
```
✅ [InterviewStore] Interviews fetched: {interviews: Array(0), total: 0}
```
UI shows "No Interviews Yet"

**Root Cause:**
Database is empty. No interviews have been created yet (seeding not run).

**Solution 1: Run Seed Script**
```bash
cd backend
node src/prisma/seed.js
```

**Solution 2: Manual Creation**
Click "Add New Interview" button and create manually.

**Expected After Seeding:**
- 3 respondents
- 5 questions in question bank
- 2 sample interviews (1 completed, 1 scheduled)

**Verification:**
```bash
# Check database
cd backend
npx prisma studio

# Navigate to "interviews" table
# Should see 2 records
```

---

### Issue 3: ❌ Questions Not Showing in Edit Form

**Symptom:**
Edit form opens but Step 2 shows "No questions added yet"

**Root Cause:**
Interview was fetched without `interviewQA` relation, or Q&A data wasn't properly mapped.

**Solution:**
Ensure `fetchInterviewById` is called before opening edit form:

```javascript
// ❌ WRONG: Using interview from list (no Q&A data)
<EditInterviewForm interview={selectedInterview} />

// ✅ CORRECT: Fetch full data first
const handleEditClick = async (interview) => {
  const result = await fetchInterviewById(interview.id);
  if (result.success) {
    setInterviewToEdit(result.data);
    setIsEditModalOpen(true);
  }
};

<EditInterviewForm interview={interviewToEdit} />
```

**Why:**
- `getInterviews()` returns interviews WITHOUT Q&A (for performance)
- `getInterviewById()` returns interview WITH full Q&A and controls
- Edit form needs complete data to populate fields

---

### Issue 4: ❌ Control Mappings Disappear After Edit

**Symptom:**
User maps controls to questions, saves, but controls don't appear in dashboard.

**Root Cause:**
Questions array not properly formatted when submitting update.

**Solution:**
Ensure controls array is included in question objects:

```javascript
// ❌ WRONG: Missing controls
questions: formData.questions.map(q => ({
  questionText: q.questionText,
  answerText: q.answerText
}))

// ✅ CORRECT: Include controls
questions: formData.questions.map(q => ({
  questionId: q.questionId,
  questionText: q.questionText,
  answerText: q.answerText || '',
  controls: q.controls || []  // Include this!
}))
```

**Verification:**
Check browser DevTools → Network → PUT request payload:
```json
{
  "questions": [
    {
      "questionText": "...",
      "controls": ["A.5.1", "A.5.2"]  // Should be present
    }
  ]
}
```

---

### Issue 5: ❌ Edit Deletes All Answers

**Symptom:**
User edits interview, saves, all previously recorded answers are gone.

**Root Cause:**
Questions array in EditInterviewForm doesn't preserve `answerText` when initialized or submitted.

**Solution 1: Initialization**
```javascript
// ✅ CORRECT: Preserve answerText when initializing
questions: interview.interviewQA?.map(qa => ({
  questionId: qa.questionId,
  questionText: qa.questionText,
  answerText: qa.answerText || '',  // Preserve existing answer
  controls: qa.interviewQAControls?.map(qac => qac.control.id) || []
})) || []
```

**Solution 2: Submission**
```javascript
// ✅ CORRECT: Include answerText in update payload
questions: formData.questions.map(q => ({
  questionId: q.questionId,
  questionText: q.questionText,
  answerText: q.answerText || '',  // Don't omit
  controls: q.controls || []
}))
```

**Verification:**
1. Create interview with questions (no answers)
2. Edit interview, add answers, save
3. View interview details → Answers should display
4. Edit again → Answers should still be in form
5. Save without changing → Answers should persist

---

### Issue 6: ❌ Respondent Dropdown Empty in Add Form

**Symptom:**
"Select Existing Respondent" dropdown is empty

**Root Cause:**
Respondents not fetched, or API endpoint not working.

**Solution:**
Check RespondentFormSection or AddInterviewForm is fetching:

```javascript
useEffect(() => {
  if (isOpen) {
    fetchRespondents();  // Must be called
  }
}, [isOpen, fetchRespondents]);
```

**Verify API Works:**
```bash
# Test in browser or curl
curl http://localhost:5000/api/interviews/respondents/all \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
{
  "respondents": [ /* array */ ],
  "total": 3
}
```

**Check Console:**
```
📥 [InterviewStore] Fetching respondents...
✅ [InterviewStore] Respondents fetched: 3 respondents
```

---

### Issue 7: ❌ Cannot Map Controls to Questions

**Symptom:**
"Map to Control" button doesn't work, or control picker is empty

**Root Cause:**
Controls not fetched in controlsStore, or AnnexA controls table is empty.

**Solution 1: Verify Controls Exist**
```bash
npx prisma studio
# Check annex_a_controls table
# Should have 93 controls (ISO 27001:2022)
```

**Solution 2: Check controlsStore**
QuestionList uses `useControlsStore`:
```javascript
const { controls, fetchControls } = useControlsStore();

// Fetch when opening picker
const handleOpenControlPicker = async (questionIndex) => {
  if (controls.length === 0) {
    await fetchControls();  // Must be called
  }
  setShowControlPicker(questionIndex);
};
```

**Solution 3: Verify API Endpoint**
```bash
# Test controls endpoint
curl http://localhost:5000/api/controls \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Testing & Validation

### Manual Testing Checklist

#### **Create Interview**
- [ ] Open Add form
- [ ] Select existing respondent from dropdown
- [ ] Verify respondent dropdown is populated
- [ ] Add interview date (future date)
- [ ] Click Next → Step 2
- [ ] Click "Add from Bank"
- [ ] Search questions, select 2 questions
- [ ] Questions appear in list
- [ ] Click "Add Custom Question"
- [ ] Custom question added with empty text
- [ ] Edit custom question text
- [ ] Click "Map to Control" on first question
- [ ] Control picker opens with searchable list
- [ ] Search for "A.5.1", select it
- [ ] Control badge appears on question
- [ ] Click X on badge to remove control
- [ ] Control removed
- [ ] Re-add control
- [ ] Click Next → Step 3
- [ ] Review shows correct data
- [ ] Click "Create Interview"
- [ ] Success message appears
- [ ] Modal closes
- [ ] New interview appears in dashboard list
- [ ] Click on interview in list
- [ ] Details panel shows respondent info
- [ ] Q&A section shows 3 questions
- [ ] Control badges show on mapped questions

#### **Edit Interview**
- [ ] Click Edit on an interview
- [ ] Edit form opens with existing data
- [ ] Step 1 shows respondent name, role, division
- [ ] Interview date is populated
- [ ] Change respondent name
- [ ] Change division
- [ ] Change status to "Completed"
- [ ] Click Next → Step 2
- [ ] Questions appear with existing data
- [ ] Add answer text to first question
- [ ] Edit answer text on second question
- [ ] Add new custom question
- [ ] Delete last question
- [ ] Reorder: Move first question down
- [ ] Map new control to a question
- [ ] Click Next → Step 3
- [ ] Review shows all changes
- [ ] Click "Save Changes"
- [ ] Success message appears
- [ ] Modal closes
- [ ] Dashboard refreshes
- [ ] Updated data appears in details panel
- [ ] Respondent name changed
- [ ] Status shows "Completed"
- [ ] Answers are visible in Q&A section
- [ ] New control badge appears

#### **Delete Interview**
- [ ] Click Delete on an interview
- [ ] Confirmation modal appears
- [ ] Shows respondent name in message
- [ ] Click Cancel → Modal closes, nothing deleted
- [ ] Click Delete again
- [ ] Click "Delete" button
- [ ] Interview is removed from list
- [ ] If it was selected, another interview is auto-selected
- [ ] Details panel updates

#### **Edge Cases**
- [ ] Create interview with 10+ questions
- [ ] Edit interview, delete all questions, try to save → Validation error
- [ ] Create interview without respondent name → Validation error
- [ ] Create interview without interview date → Validation error
- [ ] Edit interview, remove all Q&A, add new ones → Works correctly
- [ ] Map multiple controls to one question → All display
- [ ] Create interview with very long question text → Displays properly
- [ ] Create interview with special characters in name → Saves correctly

### API Testing with curl

#### Create Interview
```bash
curl -X POST http://localhost:5000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "respondentId": 1,
    "interviewDate": "2025-02-01",
    "questions": [
      {
        "questionId": 1,
        "questionText": "What is your security policy?",
        "controls": ["A.5.1"]
      }
    ]
  }'
```

#### Get Interview by ID
```bash
curl http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Interview
```bash
curl -X PUT http://localhost:5000/api/interviews/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "completed",
    "questions": [
      {
        "questionText": "Updated question",
        "answerText": "Recorded answer",
        "controls": ["A.5.1"]
      }
    ]
  }'
```

#### Delete Interview
```bash
curl -X DELETE http://localhost:5000/api/interviews/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Verification

```bash
# Open Prisma Studio
npx prisma studio

# Verify tables:
# 1. respondents - Should have 3+ entries
# 2. interviews - Check status, dates
# 3. interview_qa - Verify questionOrder, answerText
# 4. interview_qa_controls - Check control mappings
# 5. activities - Verify logged actions
```

---

## Future Development

### Planned Features

#### 1. **AI Analysis Integration**
**Status:** Database fields exist, UI prepared, logic not implemented

**Fields Ready:**
- `aiSummary` - Interview summary
- `aiKeyStatements` - Important statements (JSON array)
- `aiContradictions` - Contradictions found (JSON array)
- `aiMaturityScore` - Maturity score 0.0 to 5.0

**Implementation Plan:**
1. Create `/api/interviews/:id/analyze` endpoint
2. Use OpenAI/Claude API to analyze Q&A
3. Generate summary, extract key points
4. Detect contradictions in answers
5. Calculate maturity score based on responses
6. Update interview record with AI data
7. Display in dashboard AI Analysis section

**Prompt Example:**
```
Analyze this ISO 27001 compliance interview:

Respondent: [name], [role]
Interview Date: [date]

Q&A:
1. Q: [question] A: [answer]
2. Q: [question] A: [answer]
...

Provide:
1. Summary (2-3 sentences)
2. Key statements (bullet points)
3. Contradictions (if any)
4. Maturity score (0-5) with justification
```

#### 2. **Interview Templates**
**Status:** Not implemented

**Concept:**
- Save question sets as reusable templates
- "Risk Assessment Template" with 10 pre-defined questions
- "Physical Security Template", "Access Control Template", etc.
- Quick start for common interview types

**Database Schema:**
```prisma
model InterviewTemplate {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  category    String?
  questions   String   // JSON array of question objects
  createdById Int?
  createdAt   DateTime @default(now())

  createdBy User? @relation(fields: [createdById], references: [id])
}
```

**UI Addition:**
- "Use Template" button in Add Interview Step 2
- Template picker modal
- Load all questions from template at once

#### 3. **Interview Scheduling**
**Status:** Not implemented

**Features:**
- Calendar view of scheduled interviews
- Email notifications to respondents
- Reminder system (1 day before, 1 hour before)
- iCal export for calendar apps

**Database Changes:**
```prisma
model Interview {
  // ... existing fields
  scheduledStartTime DateTime?
  scheduledEndTime   DateTime?
  location           String?
  meetingLink        String?
  reminderSent       Boolean   @default(false)
}
```

#### 4. **Bulk Import/Export**
**Status:** Not implemented

**Features:**
- Export interviews to CSV/Excel
- Import respondents from CSV
- Import questions from CSV/Excel
- Export interview report as PDF

**Endpoints:**
```
POST /api/interviews/import
GET  /api/interviews/export?format=csv
GET  /api/interviews/:id/report.pdf
```

#### 5. **Answer Recording UI Enhancement**
**Status:** Basic implemented, can be enhanced

**Current:** Edit interview to add answers (works but not ideal for live interviews)

**Proposed:**
- Dedicated "Conduct Interview" mode
- Full-screen Q&A interface
- Voice-to-text integration
- Auto-save answers as you type
- Timer for each question
- "Next Question" / "Previous Question" navigation

**Route:** `/interviews/:id/conduct`

#### 6. **Respondent Portal**
**Status:** Not implemented

**Concept:**
- Respondents receive link to answer questions online
- Pre-fill answers before meeting
- Asynchronous interview option
- Digital signature on responses

**Security:**
- Time-limited access tokens
- One-time use links
- Read-only after submission

#### 7. **Interview Comparison**
**Status:** Not implemented

**Use Case:**
- Compare answers from multiple respondents on same question
- Track answer changes over time (re-interview same person)
- Identify consensus or discrepancies

**UI:**
- Side-by-side comparison view
- Highlight differences
- Filter by question, respondent, date range

#### 8. **Control Coverage Report**
**Status:** Not implemented

**Feature:**
- Show which controls have interview evidence
- Gaps: Controls without any interview Q&A
- Heat map: Controls with most/least evidence

**Integration:**
- Link to SOA Generator
- Link to Gap Analysis
- Auto-populate evidence references

---

### Technical Debt

#### 1. **TypeScript Migration**
**Current:** JavaScript
**Proposed:** TypeScript for type safety

**Benefits:**
- Catch field name errors at compile time (like controlTitle bug)
- Better IDE autocomplete
- Safer refactoring

**Priority:** Medium

#### 2. **Form Validation Library**
**Current:** Manual validation in each step
**Proposed:** Use Zod or Yup

**Benefits:**
- Reusable validation schemas
- Better error messages
- Consistent validation across forms

**Priority:** Low

#### 3. **Optimistic Updates**
**Current:** Wait for API response before updating UI
**Proposed:** Update UI immediately, rollback on error

**Benefits:**
- Faster perceived performance
- Better UX

**Example:**
```javascript
// Optimistic delete
const handleDelete = async (id) => {
  // Remove from UI immediately
  set(state => ({
    interviews: state.interviews.filter(i => i.id !== id)
  }));

  try {
    await apiClient.delete(`/interviews/${id}`);
  } catch (error) {
    // Rollback on error
    fetchInterviews();
    showError('Failed to delete');
  }
};
```

**Priority:** Low

#### 4. **Pagination**
**Current:** Fetch all interviews at once
**Proposed:** Paginate for large datasets

**When Needed:** >100 interviews

**Implementation:**
```javascript
// Backend
GET /api/interviews?page=1&limit=20

// Frontend
const [page, setPage] = useState(1);
const { interviews, total, pages } = await fetchInterviews({ page, limit: 20 });
```

**Priority:** Low (implement when needed)

#### 5. **Caching Strategy**
**Current:** Fetch on every mount
**Proposed:** Cache with invalidation

**Options:**
- React Query / TanStack Query
- SWR (stale-while-revalidate)
- Manual cache in Zustand with TTL

**Benefits:**
- Faster navigation
- Reduced API calls
- Offline support

**Priority:** Medium

---

### Integration Opportunities

#### 1. **Link Interviews to Documents**
**Scenario:** Interview provides evidence about document compliance

**Implementation:**
- Add `documentIds` field to Interview
- Link interview Q&A to document annotations
- "Related Interviews" section in Document Detail page

#### 2. **Link Interviews to Gaps**
**Scenario:** Interview reveals a gap in compliance

**Implementation:**
- "Create Gap from Interview" button
- Pre-fill gap description with Q&A context
- Link gap to interview for traceability

#### 3. **Link Interviews to SOA**
**Scenario:** Interview provides evidence for control applicability

**Implementation:**
- Auto-populate SOA justification from interview answers
- "Use Interview as Evidence" in SOA form
- Track which interviews support each control

---

## Appendix

### File Reference Quick Links

**Backend:**
- Controller: `backend/src/controllers/interviewsController.js`
- Routes: `backend/src/routes/interviews.routes.js`
- Schema: `backend/prisma/schema.prisma`

**Frontend:**
- Dashboard: `frontend/src/pages/InterviewDashboard.jsx`
- Add Form: `frontend/src/components/interviews/AddInterviewForm.jsx`
- Edit Form: `frontend/src/components/interviews/EditInterviewForm.jsx`
- Question List: `frontend/src/components/interviews/QuestionList.jsx`
- Question Bank Picker: `frontend/src/components/interviews/QuestionBankPicker.jsx`
- Respondent Form: `frontend/src/components/interviews/RespondentFormSection.jsx`
- Store: `frontend/src/stores/interviewStore.js`

**Common:**
- Textarea: `frontend/src/components/common/Textarea.jsx`
- Select: `frontend/src/components/common/Select.jsx`
- Step Indicator: `frontend/src/components/common/StepIndicator.jsx`

### Database Commands

```bash
# Reset database
npx prisma migrate reset

# Run migrations
npx prisma migrate dev

# Seed database
node src/prisma/seed.js

# Open Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

### Useful Queries

**Get interview with all relations:**
```javascript
const interview = await prisma.interview.findUnique({
  where: { id },
  include: {
    respondent: true,
    interviewer: true,
    interviewQA: {
      include: {
        question: true,
        interviewQAControls: {
          include: {
            control: true
          }
        }
      },
      orderBy: { questionOrder: 'asc' }
    }
  }
});
```

**Count interviews by status:**
```javascript
const stats = await prisma.interview.groupBy({
  by: ['status'],
  _count: true
});
```

**Get all interviews for a respondent:**
```javascript
const interviews = await prisma.interview.findMany({
  where: { respondentId: id },
  include: { interviewQA: true }
});
```

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-28 | 1.0 | Initial documentation | Claude |
| 2025-11-28 | 1.1 | Added bug fix: controlTitle → title | Claude |

---

## Support & Troubleshooting

**If you encounter issues:**

1. Check this documentation's "Common Issues" section
2. Review console logs (backend and frontend)
3. Verify database state in Prisma Studio
4. Check API responses in Network tab
5. Ensure seed data exists
6. Verify field names match schema

**Debug Mode:**
All functions have console logging. Look for:
- 📥 Request received
- 📡 API call
- 🔍 Querying database
- ✅ Success
- ❌ Error

**Contact:**
For questions about this implementation, refer to session context or codebase comments.

---

**End of Documentation**
