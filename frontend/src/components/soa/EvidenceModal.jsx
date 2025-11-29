// EvidenceModal.jsx
// Modal for displaying evidence (documents and interviews) linked to a control

import { useEffect } from 'react';
import { X, FileText, Users, Loader2, ExternalLink } from 'lucide-react';
import useSOAStore from '../../stores/soaStore';
import Button from '../common/Button';

export default function EvidenceModal({ controlId, isOpen, onClose }) {
  const { selectedEvidence, isLoadingEvidence, fetchEvidence, clearEvidence } = useSOAStore();

  // Fetch evidence when modal opens
  useEffect(() => {
    if (isOpen && controlId) {
      fetchEvidence(controlId);
    }

    return () => {
      if (!isOpen) {
        clearEvidence();
      }
    };
  }, [isOpen, controlId, fetchEvidence, clearEvidence]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-soft-lg">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-start z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{controlId}</h2>
            <p className="text-gray-600 mt-1">Evidence Documentation</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* Loading State */}
          {isLoadingEvidence && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-cyan-600" size={40} />
              <span className="ml-3 text-gray-600">Loading evidence...</span>
            </div>
          )}

          {/* Evidence Content */}
          {!isLoadingEvidence && selectedEvidence && (
            <div className="space-y-8">
              {/* No Evidence Message */}
              {selectedEvidence.documents.length === 0 && selectedEvidence.interviews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No evidence documented for this control yet.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add evidence by annotating documents or conducting interviews.
                  </p>
                </div>
              )}

              {/* Documents Section */}
              {selectedEvidence.documents.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={20} className="text-cyan-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Documents ({selectedEvidence.documents.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selectedEvidence.documents.map(doc => (
                      <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Document Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{doc.title}</h4>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(`/documents/${doc.slug}`, '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink size={14} />
                            View All Annotations
                          </Button>
                        </div>

                        {/* Annotations for this document */}
                        {doc.annotations && doc.annotations.length > 0 && (
                          <div className="space-y-2 mt-3">
                            <p className="text-xs font-medium text-gray-600 uppercase">
                              Annotations ({doc.annotations.length})
                            </p>
                            {doc.annotations.map(annotation => (
                              <div
                                key={annotation.id}
                                className="p-3 bg-white rounded border-l-4 shadow-sm"
                                style={{ borderColor: annotation.color || '#ffeb3b' }}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {annotation.highlightedText}
                                    </p>
                                    {annotation.annotationText && (
                                      <p className="text-xs text-gray-500 italic mt-2 border-t border-gray-100 pt-2">
                                        Note: {annotation.annotationText}
                                      </p>
                                    )}
                                    {annotation.pageNumber && (
                                      <div className="text-xs text-gray-400 mt-2">
                                        Page {annotation.pageNumber}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => window.open(`/documents/${doc.slug}?annotationId=${annotation.id}`, '_blank')}
                                    className="flex-shrink-0 px-2 py-1 text-xs font-medium text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50 rounded transition-colors"
                                    title="View this annotation in document"
                                  >
                                    <ExternalLink size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Interviews Section */}
              {selectedEvidence.interviews.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={20} className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Interviews ({selectedEvidence.interviews.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selectedEvidence.interviews.map(interview => (
                      <div key={interview.interviewId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {/* Interview Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{interview.respondentName}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              <span>{interview.respondentRole}</span>
                              {interview.respondentDivision && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span>{interview.respondentDivision}</span>
                                </>
                              )}
                              <span className="text-gray-400">•</span>
                              <span>{new Date(interview.interviewDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open('/interviews', '_blank')}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink size={14} />
                            View Interview
                          </Button>
                        </div>

                        {/* Q&A Items */}
                        {interview.qaItems && interview.qaItems.length > 0 && (
                          <div className="space-y-3 mt-3">
                            <p className="text-xs font-medium text-gray-600 uppercase">
                              Q&A ({interview.qaItems.length})
                            </p>
                            {interview.qaItems.map(qa => (
                              <div key={qa.id} className="p-3 bg-white rounded shadow-sm">
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  Q: {qa.questionText}
                                </p>
                                <p className="text-sm text-gray-700">
                                  A: {qa.answerText || <span className="italic text-gray-400">No answer provided</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
