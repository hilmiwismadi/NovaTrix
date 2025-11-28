// Document Detail View
// PDF viewer with annotation panel (Feature 3)

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText } from 'lucide-react';
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

  // Stores
  const { currentDocument, isLoading: docLoading, fetchDocumentBySlug, getPDFUrl } = useDocumentStore();
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
    await addControlToAnnotation(annotationId, controlId);
  };

  // Handle control remove
  const handleControlRemove = async (annotationId, controlId) => {
    await removeControlFromAnnotation(annotationId, controlId);
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
