# Document Annotation Feature - Complete Implementation Documentation

**Last Updated:** January 2025
**Feature:** PDF Annotation System with Annex A Control Tagging
**Status:** ✅ Fully Implemented

---

## Table of Contents
1. [Overview](#overview)
2. [Feature Set](#feature-set)
3. [Architecture](#architecture)
4. [File Structure](#file-structure)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Key Implementation Details](#key-implementation-details)
8. [Common Issues & Solutions](#common-issues--solutions)
9. [Testing Checklist](#testing-checklist)
10. [Future Enhancements](#future-enhancements)

---

## Overview

The Document Annotation Feature allows auditors to:
- Highlight text in PDF documents with color-coded compliance statuses
- Tag highlights with ISO 27001 Annex A controls
- Track document analysis progress
- View gap analysis and compliance mapping

**Tech Stack:**
- Frontend: React + Vite, Zustand (state management), Tailwind CSS
- PDF Library: @react-pdf-viewer (core, highlight, zoom, page-navigation plugins)
- Backend: Node.js + Express, Prisma ORM, PostgreSQL
- PDF.js Version: 3.11.174

---

## Feature Set

### ✅ Implemented Features

#### 1. PDF Viewer with Annotations
- **Location:** `/documents/:slug`
- **Features:**
  - Zoom in/out/fit-to-page controls
  - Text selection and highlighting
  - 5 color-coded compliance statuses
  - Click highlight to select annotation
  - Scroll to annotation on panel click

#### 2. Collapsible Analysis Header
- **Summary Section:** Editable text field, saves to `summaryShort` in database
- **Analysis Progress:** Shows annotation count (placeholder for page % calculation)
- **Annex A Mapping:** Displays unique controls tagged, badges for top 5
- **Gap Analysis:** Visual breakdown by compliance status with color-coded counts

#### 3. Annotation Panel (Right Sidebar)
- List all annotations with preview text
- Delete annotations (with confirmation)
- Tag annotations with Annex A controls
- Click annotation to scroll PDF to location
- Details button shows full annotation info modal

#### 4. Annex A Control Tagging
- Search/filter controls by ID or title
- Multi-select controls for each annotation
- Visual checkboxes with checked state
- Shows linked controls as badges on annotation card

#### 5. Details Modal
- Compliance status with color indicator
- Page number
- Full highlighted text (scrollable)
- All tagged controls with titles
- Creation timestamp

---

## Architecture

### Frontend Architecture

```
DocumentDetailView (Page)
├── Header (Title, Status Badge, Back Button)
├── Collapsible Analysis Header (Summary, Progress, Mapping, Gap Analysis)
├── Main Content Area (Flexbox)
│   ├── PDFAnnotationViewer (Left, flex-1)
│   │   ├── @react-pdf-viewer/core (Viewer)
│   │   ├── Zoom Controls (absolute top-left)
│   │   ├── Color Picker (absolute top-right)
│   │   └── Custom Highlight Rendering
│   └── AnnotationPanel (Right, w-96)
│       ├── Annotations List
│       ├── Tag Control Modal
│       └── Details Modal
```

### State Management Pattern

**Zustand Stores:**
- `documentStore` - Document CRUD, current document
- `annotationStore` - Annotation CRUD, control linking
- `controlsStore` - Annex A controls list

**Component State:**
- `selectedAnnotation` - Currently selected annotation (in DocumentDetailView)
- `highlightColor` - Current highlight color (in PDFAnnotationViewer, using ref pattern)
- `isHeaderExpanded` - Header collapse state
- `summaryText` - Editable summary text

---

## File Structure

### Frontend Files

#### `/frontend/src/pages/DocumentDetailView.jsx` (Main Page)
**Purpose:** Container page for document analysis view

**Key State:**
```javascript
const [selectedAnnotation, setSelectedAnnotation] = useState(null);
const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
const [isEditingSummary, setIsEditingSummary] = useState(false);
const [summaryText, setSummaryText] = useState('');
```

**Key Functions:**
- `handleAnnotationCreate` - Creates new annotation via store
- `handleAnnotationDelete` - Deletes annotation, clears selection if deleted
- `handleControlAdd` - Tags control to annotation, updates selectedAnnotation state
- `handleControlRemove` - Removes control tag, updates selectedAnnotation state
- `updateDocument` - Saves summary to backend

**Important:** After adding/removing controls, must update `selectedAnnotation` state with fresh data from store response to keep UI in sync.

---

#### `/frontend/src/components/pdf/PDFAnnotationViewer.jsx` (PDF Viewer)
**Purpose:** PDF rendering with custom text selection and highlighting

**Key State (using Ref for closure issue fix):**
```javascript
const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].value);
const highlightColorRef = useRef(highlightColor); // IMPORTANT: Ref for handleMouseUp closure

useEffect(() => {
  highlightColorRef.current = highlightColor; // Keep ref in sync
}, [highlightColor]);
```

**Why Ref Pattern?** The `handleDocumentLoad` useCallback creates a `handleMouseUp` listener once when PDF loads. Without ref, it captures initial color value (yellow) and never sees updates. Using ref ensures listener always gets current color value.

**Key Functions:**

1. **Text Selection (lines 172-269):**
```javascript
const handleMouseUp = () => {
  const selection = window.getSelection();
  const selectedText = selection?.toString().trim();

  // Find page using data-testid attribute
  const pageElement = textLayer.closest('.rpv-core__page-layer');
  const testId = pageElement.getAttribute('data-testid');
  const pageIndexMatch = testId?.match(/core__page-layer-(\d+)/);
  const pageIndex = pageIndexMatch ? parseInt(pageIndexMatch[1]) : 0;

  // Calculate relative position as percentages
  const pageRect = pageElement.getBoundingClientRect();
  const relativeLeft = ((rect.left - pageRect.left) / pageRect.width) * 100;

  // Create annotation with highlightColorRef.current (not highlightColor!)
  const newAnnotation = {
    content: selectedText,
    position: JSON.stringify(position),
    color: highlightColorRef.current, // Use ref here!
    pageNumber: pageIndex + 1
  };
};
```

**CRITICAL:** @react-pdf-viewer uses `data-testid="core__page-layer-{index}"` for page identification, NOT `data-page-number`. Extract page index using regex pattern matching.

2. **Highlight Rendering (lines 80-109):**
```javascript
const highlights = annotations.map(annotation => {
  const position = JSON.parse(annotation.position);

  return {
    highlightAreas: position.rects.map(rect => ({
      pageIndex: rect.pageNumber - 1, // Use rect.pageNumber, not position.pageNumber!
      left: rect.x1,
      top: rect.y1,
      width: rect.x2 - rect.x1,
      height: rect.y2 - rect.y1,
    }))
  };
});
```

**CRITICAL:** Each rect has its own `pageNumber`. Using `position.pageNumber` for all rects causes all highlights to render on same page.

3. **Scroll to Annotation (lines 48-62):**
```javascript
useEffect(() => {
  if (selectedAnnotation) {
    const position = JSON.parse(selectedAnnotation.position);
    if (position.pageNumber) {
      jumpToPage(position.pageNumber - 1); // 0-based index
    }
  }
}, [selectedAnnotation, jumpToPage]);
```

**Color Coding System:**
```javascript
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFFF00', status: 'Needs Review / To Be Verified' },
  { name: 'Green', value: '#90EE90', status: 'Compliant / Implemented' },
  { name: 'Blue', value: '#ADD8E6', status: 'Reference / Informational' },
  { name: 'Pink', value: '#FFB6C1', status: 'Gap / Non-Compliant' },
  { name: 'Orange', value: '#FFD580', status: 'Partially Compliant / In Progress' }
];
```

---

#### `/frontend/src/components/pdf/AnnotationPanel.jsx` (Sidebar Panel)
**Purpose:** Annotation management and control tagging

**Key State:**
```javascript
const [showControlPicker, setShowControlPicker] = useState(false);
const [searchControl, setSearchControl] = useState('');
const [showDetailsModal, setShowDetailsModal] = useState(false);
```

**Key Functions:**

1. **Control Toggle (lines 31-37):**
```javascript
const handleControlToggle = (controlId) => {
  if (linkedControlIds.includes(controlId)) {
    onControlRemove(selectedAnnotation.id, controlId);
  } else {
    onControlAdd(selectedAnnotation.id, controlId);
  }
};
```

2. **Modal Pattern (lines 154-262, 264-364):**
```javascript
<div className="fixed inset-0 bg-black bg-opacity-30 z-40" /> {/* Backdrop */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
  <div className="pointer-events-auto"> {/* Modal content */}
```

**Why this pattern?**
- Outer wrapper: `pointer-events-none` allows clicks to pass through to backdrop
- Inner card: `pointer-events-auto` enables clicking inside modal
- This ensures backdrop closes modal, but modal content is interactive

---

### Backend Files

#### `/backend/src/controllers/annotationsController.js`
**Purpose:** CRUD operations for annotations and control linking

**CRITICAL FIXES APPLIED:**

1. **Field Mapping (lines 33-38, 100-106):**
```javascript
// Backend stores: highlightedText, positionData
// Frontend expects: content, position, pageNumber

// CREATE - Map frontend → backend
highlightedText: content,
positionData: typeof position === 'string' ? position : JSON.stringify(position),

// GET - Map backend → frontend
const mappedAnnotations = annotations.map(ann => ({
  ...ann,
  content: ann.highlightedText,
  position: ann.positionData,
  pageNumber: JSON.parse(ann.positionData).pageNumber
}));
```

2. **Control ID Type (lines 269, 284, 335):**
```javascript
// Control IDs are strings like "A.5.1", NOT integers
const control = await prisma.annexAControl.findUnique({
  where: { id: controlId } // NOT parseInt(controlId)!
});

// Create annotation control link
await prisma.annotationControl.create({
  data: {
    annotationId: parseInt(id), // Annotation ID is integer
    controlId: controlId // Control ID is string!
  }
});
```

**BUG HISTORY:** Initially used `parseInt(controlId)` which converted "A.5.1" to NaN, causing 500 errors. Control IDs must remain strings.

---

#### `/backend/src/controllers/documentsController.js`
**Purpose:** Document CRUD operations

**Update Document Endpoint (lines 200-240):**
```javascript
export const updateDocument = async (req, res) => {
  const { slug } = req.params;
  const { summaryShort, summaryDetailed, summaryIsoCompliance, status } = req.body;

  const updatedDocument = await prisma.document.update({
    where: { slug },
    data: updateData
  });
};
```

---

### Frontend Stores

#### `/frontend/src/stores/annotationStore.js`
**Purpose:** Annotation state management

**CRITICAL FIX - Field Mapping in Control Operations (lines 100-106, 130-136):**
```javascript
// After adding/removing control, backend returns annotation with DB field names
// Must map to frontend field names to keep rendering working

const mappedAnnotation = {
  ...response.data.annotation,
  content: response.data.annotation.highlightedText,
  position: response.data.annotation.positionData,
  pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber
};

set((state) => ({
  annotations: state.annotations.map((ann) =>
    ann.id === annotationId ? mappedAnnotation : ann // Use mapped version!
  )
}));

return { success: true, data: mappedAnnotation }; // Return mapped version!
```

**BUG HISTORY:** Without mapping, backend response had `highlightedText`/`positionData` but PDF viewer expected `content`/`position`. This caused highlights to disappear after tagging controls.

---

## Database Schema

### Relevant Tables

#### `Document`
```prisma
model Document {
  id                   Int      @id @default(autoincrement())
  title                String
  slug                 String   @unique
  filePath             String   @map("file_path")
  summaryShort         String?  @map("summary_short")         // ← Used for header summary
  summaryDetailed      String?  @map("summary_detailed")
  summaryIsoCompliance String?  @map("summary_iso_compliance")
  readPercentage       Float    @default(0.0) @map("read_percentage")
  gapCount             Int      @default(0) @map("gap_count")

  annotations Annotation[]
}
```

#### `Annotation`
```prisma
model Annotation {
  id              Int      @id @default(autoincrement())
  documentId      Int      @map("document_id")
  positionData    String   @map("position_data")      // JSON: { boundingRect, rects[], pageNumber }
  highlightedText String   @map("highlighted_text")   // Selected text content
  annotationText  String?  @map("annotation_text")    // Optional user comment
  color           String   @default("#ffeb3b")        // Hex color code
  createdAt       DateTime @default(now()) @map("created_at")

  document            Document            @relation(fields: [documentId], references: [id], onDelete: Cascade)
  annotationControls  AnnotationControl[]
}
```

#### `AnnexAControl`
```prisma
model AnnexAControl {
  id          String  @id                           // ← STRING! e.g., "A.5.1"
  title       String
  description String  @db.Text
  category    String

  annotationControls AnnotationControl[]
}
```

#### `AnnotationControl` (Junction Table)
```prisma
model AnnotationControl {
  id           Int      @id @default(autoincrement())
  annotationId Int      @map("annotation_id")
  controlId    String   @map("control_id")          // ← STRING! Foreign key to AnnexAControl.id

  annotation Annotation    @relation(fields: [annotationId], references: [id], onDelete: Cascade)
  control    AnnexAControl @relation(fields: [controlId], references: [id], onDelete: Cascade)

  @@unique([annotationId, controlId])
}
```

**CRITICAL:** `AnnexAControl.id` is a STRING (e.g., "A.5.1"), not an integer. Never use `parseInt()` on control IDs.

---

## API Endpoints

### Annotation Endpoints

#### `GET /api/annotations/document/:documentId`
**Purpose:** Get all annotations for a document

**Response:**
```json
{
  "annotations": [
    {
      "id": 1,
      "content": "highlighted text",         // Mapped from highlightedText
      "position": "{...}",                   // Mapped from positionData
      "pageNumber": 3,                       // Extracted from position JSON
      "color": "#FFFF00",
      "annotationControls": [
        {
          "id": 1,
          "control": {
            "id": "A.5.1",                   // String ID!
            "title": "Control title"
          }
        }
      ],
      "createdAt": "2025-01-28T..."
    }
  ],
  "total": 1
}
```

#### `POST /api/annotations`
**Purpose:** Create new annotation

**Request Body:**
```json
{
  "documentId": 5,
  "content": "Selected text",
  "position": "{\"boundingRect\":{...},\"rects\":[...],\"pageNumber\":3}",
  "color": "#90EE90",
  "pageNumber": 3,
  "controlIds": ["A.5.1", "A.6.2"]  // Optional, strings!
}
```

#### `DELETE /api/annotations/:id`
**Purpose:** Delete annotation (cascades to annotation_controls)

#### `POST /api/annotations/:id/controls`
**Purpose:** Tag control to annotation

**Request Body:**
```json
{
  "controlId": "A.5.1"  // String, not integer!
}
```

#### `DELETE /api/annotations/:id/controls/:controlId`
**Purpose:** Remove control tag from annotation

**Note:** `:controlId` in URL is a string like "A.5.1"

### Document Endpoints

#### `PUT /api/documents/:slug`
**Purpose:** Update document metadata

**Request Body:**
```json
{
  "summaryShort": "Document summary text",
  "status": "analyzed"  // Optional
}
```

### Control Endpoints

#### `GET /api/controls`
**Purpose:** Get all Annex A controls

**Query Params:** `?category=organizational` (optional)

**Response:**
```json
{
  "controls": [
    {
      "id": "A.5.1",        // String!
      "title": "Policies for information security",
      "description": "...",
      "category": "organizational"
    }
  ],
  "total": 93
}
```

---

## Key Implementation Details

### 1. Position Data Structure

Annotations store position as JSON string:

```json
{
  "boundingRect": {
    "x1": 14.7,
    "y1": 29.5,
    "x2": 85.2,
    "y2": 33.0,
    "width": 70.5,
    "height": 3.5,
    "pageNumber": 3
  },
  "rects": [
    {
      "x1": 14.7,
      "y1": 29.5,
      "x2": 85.2,
      "y2": 33.0,
      "width": 70.5,
      "height": 3.5,
      "pageNumber": 3  // Each rect has its own pageNumber!
    }
  ],
  "pageNumber": 3
}
```

**All coordinates are percentages** (0-100%) relative to page dimensions for responsive rendering.

### 2. Page Number Detection

@react-pdf-viewer doesn't use `data-page-number`. Instead:

```javascript
// Correct way to detect page
const pageElement = textLayer.closest('.rpv-core__page-layer');
const testId = pageElement.getAttribute('data-testid');
// testId format: "core__page-layer-0", "core__page-layer-1", etc.
const pageIndexMatch = testId?.match(/core__page-layer-(\d+)/);
const pageIndex = pageIndexMatch ? parseInt(pageIndexMatch[1]) : 0;
const pageNumber = pageIndex + 1; // Convert to 1-based for user display
```

### 3. Color Reference System

The highlight color determines compliance status:

| Color | Hex Code | Status | Use Case |
|-------|----------|--------|----------|
| 🟡 Yellow | #FFFF00 | Needs Review | Initial tagging, uncertain status |
| 🟢 Green | #90EE90 | Compliant | Evidence found, control implemented |
| 🔵 Blue | #ADD8E6 | Reference | Supporting info, not direct evidence |
| 🔴 Pink | #FFB6C1 | Gap | Missing control, non-compliant |
| 🟠 Orange | #FFD580 | In Progress | Partial implementation |

### 4. Modal Z-Index Hierarchy

```
z-40: Modal backdrop (bg-black bg-opacity-30)
z-50: Modal container (flex centering)
z-50: Modal content (pointer-events-auto)
```

Outer wrapper has `pointer-events-none` so clicks pass through to backdrop (which closes modal). Inner card has `pointer-events-auto` to enable interaction.

---

## Common Issues & Solutions

### Issue 1: Highlights Always Appear on Page 1

**Symptom:** User highlights text on page 3, but after refresh it appears on page 1 (same position, wrong page).

**Root Cause:** Using `position.pageNumber` instead of `rect.pageNumber` when transforming annotations for rendering.

**Fix:** In PDFAnnotationViewer.jsx line 92:
```javascript
// WRONG:
pageIndex: position.pageNumber - 1

// CORRECT:
pageIndex: rect.pageNumber - 1  // Use rect's pageNumber!
```

**Why:** Each rect in position.rects has its own pageNumber. position.pageNumber is a summary field, but rendering needs per-rect page numbers.

---

### Issue 2: Color Selection Doesn't Work (Always Yellow)

**Symptom:** User selects green/blue/pink color, but annotation is always created yellow.

**Root Cause:** JavaScript closure issue. The `handleMouseUp` listener is created once during document load and captures the initial `highlightColor` state value (yellow). When user changes color, the listener still uses the old captured value.

**Fix:** Use ref pattern in PDFAnnotationViewer.jsx:
```javascript
const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].value);
const highlightColorRef = useRef(highlightColor);

useEffect(() => {
  highlightColorRef.current = highlightColor; // Keep ref synced
}, [highlightColor]);

// In handleMouseUp:
color: highlightColorRef.current  // Use ref, not state!

// In useCallback dependencies:
}, [onAnnotationCreate]); // Remove highlightColor from deps
```

---

### Issue 3: Annotations Disappear After Tagging Controls

**Symptom:** User tags a control to annotation, the annotation disappears from PDF (but still in panel). Reappears after refresh.

**Root Cause:** Backend returns annotation with database field names (`highlightedText`, `positionData`), but frontend expects mapped names (`content`, `position`). Without mapping, PDF viewer can't find position data and doesn't render.

**Fix:** In annotationStore.js `addControlToAnnotation` and `removeControlFromAnnotation`:
```javascript
const response = await apiClient.post(...);

// Map backend fields to frontend fields
const mappedAnnotation = {
  ...response.data.annotation,
  content: response.data.annotation.highlightedText,
  position: response.data.annotation.positionData,
  pageNumber: JSON.parse(response.data.annotation.positionData).pageNumber
};

// Update state with mapped version
set((state) => ({
  annotations: state.annotations.map((ann) =>
    ann.id === annotationId ? mappedAnnotation : ann
  )
}));

return { success: true, data: mappedAnnotation };
```

---

### Issue 4: 500 Error When Tagging Controls

**Symptom:** Clicking control in Tag Control modal gives 500 Internal Server Error.

**Root Cause:** Backend code used `parseInt(controlId)` but control IDs are strings like "A.5.1". parseInt("A.5.1") returns NaN, causing database query to fail.

**Fix:** In annotationsController.js (multiple locations):
```javascript
// WRONG:
where: { id: parseInt(controlId) }
controlId: parseInt(controlId)

// CORRECT:
where: { id: controlId }       // controlId is already a string
controlId: controlId            // Don't parse!
```

**Affected Lines:**
- Line 269: `findUnique` for control existence check
- Line 284: `create` annotation control link
- Line 99: `create` during annotation creation
- Line 171: `create` during annotation update
- Line 335: `findFirst` for removing control link

---

### Issue 5: Selected Annotation Checkbox Doesn't Update in Modal

**Symptom:** User clicks control checkbox in Tag Control modal, function works (control gets tagged) but checkbox doesn't show checked state immediately. Only appears after closing and reopening modal.

**Root Cause:** `selectedAnnotation` state in DocumentDetailView isn't updated after control add/remove. Modal reads from stale state.

**Fix:** In DocumentDetailView.jsx `handleControlAdd` and `handleControlRemove`:
```javascript
const handleControlAdd = async (annotationId, controlId) => {
  const result = await addControlToAnnotation(annotationId, controlId);
  if (result.success && selectedAnnotation?.id === annotationId) {
    setSelectedAnnotation(result.data); // Update selected annotation!
  }
};
```

---

### Issue 6: Tag Control Modal Background Too Dark

**Symptom:** Modal backdrop is very dark (50% opacity), hard to see underlying content.

**Fix:** In AnnotationPanel.jsx line 158:
```javascript
// Changed from bg-opacity-50 to bg-opacity-30
className="fixed inset-0 bg-black bg-opacity-30 z-40"
```

---

### Issue 7: Can't Click Checkboxes in Tag Control Modal

**Symptom:** Modal appears but clicking controls doesn't work.

**Root Cause:** Pointer events conflict. Modal wrapper was catching all clicks before they reached content.

**Fix:** In AnnotationPanel.jsx modal structure:
```javascript
{/* Wrapper - allows clicks to pass through */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
  {/* Card - captures clicks */}
  <div className="bg-white rounded-lg ... pointer-events-auto">
```

---

### Issue 8: data-page-number Attribute Returns Null

**Symptom:** Console log shows `data-page-number: null`, page detection always returns 1.

**Root Cause:** @react-pdf-viewer doesn't set `data-page-number` attribute. It uses `data-testid` with format `core__page-layer-{index}`.

**Fix:** In PDFAnnotationViewer.jsx handleMouseUp:
```javascript
// WRONG:
const pageNumber = pageElement.getAttribute('data-page-number');

// CORRECT:
const testId = pageElement.getAttribute('data-testid');
const pageIndexMatch = testId?.match(/core__page-layer-(\d+)/);
const pageIndex = pageIndexMatch ? parseInt(pageIndexMatch[1]) : 0;
```

---

## Testing Checklist

### PDF Viewing
- [ ] PDF loads and displays correctly
- [ ] Zoom in/out/fit controls work
- [ ] Can scroll through multi-page documents
- [ ] PDF URL authentication token is valid

### Text Selection & Highlighting
- [ ] Can select text with mouse
- [ ] Selection appears on correct page
- [ ] Highlight appears immediately after selection
- [ ] Highlight color matches selected color
- [ ] Can select text on any page (not just page 1)
- [ ] Multiple highlights on same page render correctly
- [ ] Highlights on different pages render independently

### Color Selection
- [ ] Can click color buttons to change active color
- [ ] Selected color shows border/scale effect
- [ ] Tooltip shows compliance status on hover
- [ ] Next highlight uses newly selected color
- [ ] Color persists across multiple highlights

### Annotation Panel
- [ ] Shows count of annotations
- [ ] Lists all annotations with preview text
- [ ] Shows page number for each annotation
- [ ] Displays color indicator per annotation
- [ ] Linked controls appear as badges
- [ ] "No annotations yet" message when empty

### Annotation Selection
- [ ] Clicking annotation in panel selects it
- [ ] Selected annotation highlights in panel (cyan background)
- [ ] Selected annotation highlights in PDF (cyan border)
- [ ] PDF scrolls to selected annotation's page
- [ ] Tag Control and Details buttons appear for selected annotation

### Control Tagging
- [ ] Tag Control button opens modal
- [ ] Modal is centered with backdrop
- [ ] Can close modal by clicking backdrop or X button
- [ ] Search input filters controls by ID and title
- [ ] Checkboxes show checked state for linked controls
- [ ] Clicking control toggles link (adds if not linked, removes if linked)
- [ ] Checkbox updates immediately after click
- [ ] Control badges update in panel after tagging
- [ ] Can tag multiple controls to one annotation
- [ ] Selection count updates in footer

### Details Modal
- [ ] Details button opens modal
- [ ] Shows correct compliance status with color
- [ ] Displays page number
- [ ] Shows full highlighted text (scrollable if long)
- [ ] Lists all tagged controls with titles
- [ ] Shows creation timestamp (if available)
- [ ] Close button works

### Annotation Deletion
- [ ] Delete button shows trash icon
- [ ] Confirmation dialog appears
- [ ] Canceling keeps annotation
- [ ] Confirming deletes annotation
- [ ] Annotation removes from panel
- [ ] Highlight removes from PDF
- [ ] If deleted annotation was selected, selection clears

### Collapsible Header
- [ ] Header is expanded by default
- [ ] Clicking dropdown toggles collapse/expand
- [ ] Chevron icon changes direction
- [ ] Summary section appears when expanded
- [ ] Progress, Mapping, Gap Analysis sections visible when expanded

### Summary Editing
- [ ] Edit button appears when not editing
- [ ] Clicking Edit shows textarea
- [ ] Can type in textarea
- [ ] Save button persists to backend (check network tab)
- [ ] Cancel button discards changes
- [ ] Summary displays after save
- [ ] Summary persists after page refresh

### Analysis Metrics
- [ ] Annotation count is correct
- [ ] Gap Analysis shows correct counts per color
- [ ] Annex A Mapping shows unique control count
- [ ] Control badges show top 5 + "more" indicator
- [ ] Clicking control badge (future: should navigate to control page)

### Data Persistence
- [ ] Annotations persist after page refresh
- [ ] Control links persist after refresh
- [ ] Summary persists after refresh
- [ ] Colors persist correctly
- [ ] Page numbers are correct after refresh

### Error Handling
- [ ] No console errors during normal operation
- [ ] Position data parsing errors don't crash app
- [ ] Invalid control IDs don't cause 500 errors
- [ ] Missing position data shows warning, doesn't render
- [ ] Network errors show in store error state

### Cross-Browser Testing
- [ ] Works in Chrome/Edge
- [ ] Works in Firefox
- [ ] Works in Safari (if applicable)
- [ ] PDF rendering is consistent across browsers

---

## Future Enhancements

### High Priority

1. **Progress Percentage Calculation**
   - Currently placeholder shows "0%"
   - Calculate based on: pages with annotations / total pages
   - Or: unique pages annotated / total pages
   - Update readPercentage in database

2. **Annotation Comments/Notes**
   - Add text field to annotation (use annotationText column)
   - Allow users to add context beyond just highlighting
   - Show in Details modal

3. **Bidirectional Navigation: Controls ↔ Documents**
   - In /controls page, show document annotations per control
   - Click control card → modal with list of annotations
   - Click annotation in list → navigate to document + scroll to annotation
   - Update DocumentDetailView to accept query param: ?annotation={id}

4. **Export Gap Analysis Report**
   - Generate PDF/Excel report of gaps (pink highlights)
   - Group by Annex A control
   - Include highlighted text and page references

### Medium Priority

5. **Annotation Search/Filter**
   - Filter annotations by:
     - Compliance status (color)
     - Tagged controls
     - Page range
     - Date range
   - Search annotation text content

6. **Bulk Operations**
   - Select multiple annotations
   - Bulk tag controls
   - Bulk change color/status
   - Bulk delete with confirmation

7. **Annotation Editing**
   - Edit annotation color after creation
   - Add/edit annotation comments
   - Merge overlapping annotations

8. **Control Recommendations**
   - AI/keyword matching to suggest relevant controls
   - Based on highlighted text content
   - Pre-populate Tag Control modal with suggestions

9. **Collaboration Features**
   - Annotation authorship (currently no user tracking)
   - Comments/discussions on annotations
   - Assignment to team members

10. **Document Comparison**
    - Compare annotations across document versions
    - Show what changed between revisions
    - Track progress over time

### Low Priority

11. **Keyboard Shortcuts**
    - H: Toggle highlight mode
    - Delete: Remove selected annotation
    - T: Tag control
    - D: Show details
    - Arrow keys: Navigate annotations

12. **Annotation Templates**
    - Predefined highlight + control combos
    - Quick apply common patterns
    - Save custom templates

13. **Advanced Gap Analysis**
    - Visual charts (pie, bar graphs)
    - Trend analysis over time
    - Comparison across multiple documents
    - Coverage heatmap by Annex A section

14. **Responsive Layout**
    - Currently desktop-focused
    - Adapt for tablet/mobile viewing
    - Collapsible panels for small screens

---

## Debugging Tips

### Enable Detailed Logging

In PDFAnnotationViewer.jsx, there are debug logs that can be uncommented:

```javascript
// Line 45: PDF load confirmation
console.log('📄 PDF loaded with', annotations.length, 'annotations');

// Line 189: Page detection
console.log('🔢 data-testid:', testId);
console.log('✨ Creating annotation on page:', pageIndex + 1);

// Line 253: Annotation creation
console.log('Creating annotation:', newAnnotation);
```

### Check Network Tab

**Annotation Creation:**
- POST /api/annotations
- Should return 201 with annotation object
- Check response has `highlightedText`, `positionData` fields

**Control Tagging:**
- POST /api/annotations/{id}/controls
- Should return 200 with updated annotation
- Check response includes annotationControls array

**Summary Save:**
- PUT /api/documents/{slug}
- Should return 200 with updated document
- Check response has updated summaryShort

### Common Console Errors

**"Cannot read properties of undefined (reading 'rects')"**
- Position data is missing or malformed
- Check annotation.position is valid JSON
- Verify backend mapped fields correctly

**"pageNumber is undefined"**
- rect.pageNumber is missing in position data
- Ensure creation logic sets pageNumber on each rect
- Check backend isn't stripping pageNumber from rects

**"Control not found" (404)**
- Control ID doesn't exist in database
- Verify controls were seeded
- Check controlId is string, not number

---

## Architecture Decisions

### Why @react-pdf-viewer Instead of react-pdf-highlighter?

**Original library:** react-pdf-highlighter-extended

**Issues:**
- Version mismatch: pdfjs-dist@4.4.168 vs worker@4.10.38
- Limited customization of highlight rendering
- Poor TypeScript support

**Replacement:** @react-pdf-viewer ecosystem

**Benefits:**
- Modular plugin architecture (core, highlight, zoom, page-navigation)
- Active maintenance and updates
- Better control over rendering and styling
- Compatible with latest PDF.js versions
- No version mismatch issues

### Why Zustand Instead of Redux?

**Reasons:**
- Simpler API, less boilerplate
- No need for actions/reducers pattern
- Built-in async support
- Smaller bundle size
- Easier to understand for new developers

### Why Store Position as JSON String?

**Alternative:** Separate columns for x1, y1, x2, y2, pageNumber

**Reasons for JSON:**
- Flexible structure (can add new fields without migration)
- Supports multi-rect highlights (text spanning lines)
- Easier to pass around as single field
- Natural fit for API request/response

**Drawback:** Can't query by specific coordinates

### Why String IDs for Controls?

**Alternative:** Auto-increment integer IDs with separate code field

**Reasons for string:**
- ISO 27001 controls are known by their codes (A.5.1, A.6.2, etc.)
- Code IS the identifier, not just a label
- Easier for users to recognize and reference
- No need to join or look up codes

**Implementation note:** Must never use parseInt() on control IDs

---

## Code Quality Notes

### Consistent Patterns

1. **Error Handling:**
   - All store methods return `{ success: boolean, data?: any, error?: string }`
   - Frontend checks `result.success` before proceeding
   - Errors set in store state for UI display

2. **Field Naming:**
   - Database: snake_case (summary_short)
   - Backend API: camelCase (summaryShort)
   - Frontend: camelCase (summaryShort)
   - Map at boundaries (controller layer)

3. **Modal Structure:**
   - Always use backdrop + centered container pattern
   - Backdrop: `fixed inset-0 bg-black bg-opacity-30 z-40`
   - Container: `fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none`
   - Card: `pointer-events-auto max-w-{size} flex flex-col`

4. **Button Patterns:**
   - Primary actions: variant="primary"
   - Secondary actions: variant="secondary"
   - Destructive actions: text-red-600 with confirmation
   - Always include icon + text for clarity

### Performance Considerations

1. **Annotation Rendering:**
   - Highlights filtered by page before rendering
   - Only visible pages render highlights
   - Use React.memo if performance issues arise

2. **Control Search:**
   - Filters on client side (93 controls, small dataset)
   - If controls list grows, consider debounced search
   - Could add backend search endpoint

3. **Large Documents:**
   - PDF.js handles pagination efficiently
   - Only renders visible pages
   - If 1000+ annotations, consider virtualization for panel list

---

## Quick Reference

### Key Commands

```bash
# Start frontend (from /NovaTrix/frontend)
npm run dev

# Start backend (from /NovaTrix/backend)
npm run dev

# Database migrations (after schema changes)
npx prisma migrate dev

# Regenerate Prisma client (after schema changes)
npx prisma generate
```

### Important URLs

- Document Detail: `http://localhost:5174/documents/:slug`
- Backend API: `http://localhost:5000/api`
- PDF Endpoint: `http://localhost:5000/api/documents/:slug/pdf?token={jwt}`

### Quick Fixes

**Highlights not showing:**
1. Check position data has pageNumber in rects
2. Verify rect.pageNumber is used (not position.pageNumber)
3. Check annotation.position is valid JSON

**Color always yellow:**
1. Check highlightColorRef pattern is implemented
2. Verify ref is used in handleMouseUp (not state)
3. Remove highlightColor from useCallback deps

**Controls error 500:**
1. Ensure controlId is NOT parsed as integer
2. Check AnnexAControl.id is string type in schema
3. Verify annotationControl.controlId is string type

**Annotations disappear after tagging:**
1. Check store maps response fields
2. Verify mapping includes content, position, pageNumber
3. Ensure mapped version is returned and used in state

---

## Contact & Support

For bugs or questions about this implementation:
1. Check this documentation first
2. Review console logs and network tab
3. Check database records directly
4. Review git history for relevant commits

**Key Files to Check:**
- Frontend: DocumentDetailView.jsx, PDFAnnotationViewer.jsx, AnnotationPanel.jsx
- Backend: annotationsController.js, documentsController.js
- Store: annotationStore.js, documentStore.js
- Schema: backend/prisma/schema.prisma

---

**Document Version:** 1.0
**Last Tested:** January 2025
**Tested With:** React 18, @react-pdf-viewer/core 3.12.0, PDF.js 3.11.174, Prisma 5.x
