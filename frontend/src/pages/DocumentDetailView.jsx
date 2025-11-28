// Document Detail View
// PDF viewer with annotation panel (Feature 3)

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, ChevronDown, ChevronUp, Edit2, Save, X } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import PDFAnnotationViewer from '../components/pdf/PDFAnnotationViewer';
import AnnotationPanel from '../components/pdf/AnnotationPanel';
import useDocumentStore from '../stores/documentStore';
import useAnnotationStore from '../stores/annotationStore';
import useControlsStore from '../stores/controlsStore';

export default function DocumentDetailView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  // Stores
  const { currentDocument, isLoading: docLoading, fetchDocumentBySlug, getPDFUrl, updateDocument } = useDocumentStore();
  const {
    annotations,
    isLoading: annoLoading,
    fetchAnnotations,
    createAnnotation,
    deleteAnnotation,
    addControlToAnnotation,
    removeControlFromAnnotation
  } = useAnnotationStore();
  const { controls, fetchControls } = useControlsStore();

  // Compute PDF URL
  const pdfUrl = useMemo(() => {
    if (!slug) return null;
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl.startsWith('http')
      ? apiUrl
      : `http://localhost:5000${apiUrl}`;
    return `${baseUrl}/documents/${slug}/pdf?token=${token}`;
  }, [slug]);

  // Fetch document, annotations, and controls
  useEffect(() => {
    if (slug) {
      fetchDocumentBySlug(slug);
    }
  }, [slug]);

  useEffect(() => {
    if (currentDocument) {
      fetchAnnotations(currentDocument.id);
      fetchControls();
      setSummaryText(currentDocument.summaryShort || '');
    }
  }, [currentDocument]);

  // Handle annotation creation
  const handleAnnotationCreate = async (annotationData) => {
    const result = await createAnnotation({
      ...annotationData,
      documentId: currentDocument.id
    });

    if (result.success) {
      console.log('Annotation created:', result.data);
    }
  };

  // Handle annotation deletion
  const handleAnnotationDelete = async (annotationId) => {
    await deleteAnnotation(annotationId);
    if (selectedAnnotation?.id === annotationId) {
      setSelectedAnnotation(null);
    }
  };

  // Handle control add
  const handleControlAdd = async (annotationId, controlId) => {
    const result = await addControlToAnnotation(annotationId, controlId);
    if (result.success && selectedAnnotation?.id === annotationId) {
      // Update selected annotation with the latest data
      setSelectedAnnotation(result.data);
    }
  };

  // Handle control remove
  const handleControlRemove = async (annotationId, controlId) => {
    const result = await removeControlFromAnnotation(annotationId, controlId);
    if (result.success && selectedAnnotation?.id === annotationId) {
      // Update selected annotation with the latest data
      setSelectedAnnotation(result.data);
    }
  };

  if (docLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    );
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Document not found</h2>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate('/documents')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{currentDocument.title}</h1>
              <p className="text-xs text-gray-500">
                {currentDocument.fileType} • {currentDocument.fileSize} • {annotations.length} annotation{annotations.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Badge variant={currentDocument.status}>{currentDocument.status.toUpperCase()}</Badge>
        </div>
      </div>

      {/* Collapsible Analysis Header */}
      <div className="bg-white border-b border-gray-200">
        <button
          onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
          className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-md font-semibold text-gray-900">Document Analysis</h2>
          {isHeaderExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isHeaderExpanded && (
          <div className="px-6 pb-4 grid grid-cols-2 gap-4">
            {/* Summary Section */}
            <div className="col-span-2 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Summary</h3>
                {!isEditingSummary ? (
                  <button
                    onClick={() => setIsEditingSummary(true)}
                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 text-xs"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const result = await updateDocument(slug, { summaryShort: summaryText });
                        if (result.success) {
                          setIsEditingSummary(false);
                        }
                      }}
                      className="text-green-600 hover:text-green-700 flex items-center gap-1 text-xs"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setSummaryText(currentDocument?.summaryShort || '');
                        setIsEditingSummary(false);
                      }}
                      className="text-gray-600 hover:text-gray-700 flex items-center gap-1 text-xs"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              {isEditingSummary ? (
                <textarea
                  value={summaryText}
                  onChange={(e) => setSummaryText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px]"
                  placeholder="Enter document summary..."
                />
              ) : (
                <p className="text-sm text-gray-600">
                  {summaryText || 'No summary yet. Click Edit to add one.'}
                </p>
              )}
            </div>

            {/* Progress */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Analysis Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Annotations</span>
                  <span className="font-semibold">{annotations.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all"
                    style={{ width: '0%' }} // TODO: Calculate based on pages analyzed
                  />
                </div>
                <p className="text-xs text-gray-500">0% of document analyzed</p>
              </div>
            </div>

            {/* Annex A Mapping */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Annex A Controls Mapped</h3>
              <div className="space-y-2">
                {(() => {
                  const uniqueControls = new Set();
                  annotations.forEach(ann => {
                    ann.annotationControls?.forEach(ac => {
                      uniqueControls.add(ac.control.id);
                    });
                  });
                  return (
                    <>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Controls Tagged</span>
                        <span className="font-semibold">{uniqueControls.size}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.from(uniqueControls).slice(0, 5).map(controlId => (
                          <Badge key={controlId} variant="default" size="sm">{controlId}</Badge>
                        ))}
                        {uniqueControls.size > 5 && (
                          <Badge variant="default" size="sm">+{uniqueControls.size - 5} more</Badge>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Gap Analysis */}
            <div className="col-span-2 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Gap Analysis</h3>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { color: '#90EE90', label: 'Compliant', count: annotations.filter(a => a.color === '#90EE90').length },
                  { color: '#FFFF00', label: 'To Review', count: annotations.filter(a => a.color === '#FFFF00').length },
                  { color: '#FFD580', label: 'In Progress', count: annotations.filter(a => a.color === '#FFD580').length },
                  { color: '#FFB6C1', label: 'Gaps', count: annotations.filter(a => a.color === '#FFB6C1').length }
                ].map((status) => (
                  <div key={status.label} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: status.color }}
                      />
                      <p className="text-xs text-gray-600">{status.label}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area - PDF Viewer + Annotation Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {pdfUrl ? (
            <PDFAnnotationViewer
              pdfUrl={pdfUrl}
              annotations={annotations}
              selectedAnnotation={selectedAnnotation}
              onAnnotationCreate={handleAnnotationCreate}
              onAnnotationSelect={setSelectedAnnotation}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-cyan-600" size={48} />
            </div>
          )}
        </div>

        {/* Annotation Panel */}
        <div className="w-96 flex-shrink-0">
          <AnnotationPanel
            annotations={annotations}
            controls={controls}
            selectedAnnotation={selectedAnnotation}
            onAnnotationSelect={setSelectedAnnotation}
            onAnnotationDelete={handleAnnotationDelete}
            onControlAdd={handleControlAdd}
            onControlRemove={handleControlRemove}
          />
        </div>
      </div>
    </div>
  );
}
