// Annotation Panel Component
// Sidebar panel for managing annotations and tagging with controls

import { useState, useEffect } from 'react';
import { X, Tag, Trash2, Plus, Check, Info, Copy, Filter } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const parseAiSummary = (summary = '') => {
  if (!summary) return null;
  if (typeof summary === 'object') {
    return {
      controlId: summary.controlId || summary.control_id || '',
      applicable: summary.applicable || '',
      implementationStatus: summary.implementationStatus || summary.implementation_status || '',
      justification: summary.justification || '',
      recommendation: summary.recommendation || '',
      retrievedControls: Array.isArray(summary.retrievedControls)
        ? summary.retrievedControls.map((item) => ({ id: item.id, score: Number(item.score || 0) }))
        : Array.isArray(summary.retrieved_controls)
          ? summary.retrieved_controls.map((item) => ({ id: item.id, score: Number(item.score || 0) }))
          : []
    };
  }
  const text = String(summary);
  try {
    const directJson = JSON.parse(text);
    if (directJson && typeof directJson === 'object') {
      return parseAiSummary(directJson);
    }
  } catch {
    // continue with markdown parsing
  }
  const read = (label) => {
    const pattern = new RegExp(`\\*\\*${label}\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
    return text.match(pattern)?.[1]?.trim() || '';
  };
  const controlId = read('Control ID');
  const applicable = read('Applicable');
  const implementationStatus = read('Implementation Status');
  const justification = read('Justification');
  const recommendation = read('Recommendation');
  const retrievedRaw = read('Retrieved Controls');
  const retrievedControls = retrievedRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('-'))
    .map((line) => {
      const cleaned = line.replace(/^-+\s*/, '');
      const idMatch = cleaned.match(/^([A-Za-z0-9.-]+)/);
      const scoreMatch = cleaned.match(/score:\s*([\d.]+)/);
      return { id: idMatch ? idMatch[1] : cleaned, score: scoreMatch ? parseFloat(scoreMatch[1]) : 0 };
    });

  return {
    controlId,
    applicable,
    implementationStatus,
    justification,
    recommendation,
    retrievedControls
  };
};

export default function AnnotationPanel({
  annotations = [],
  controls = [],
  selectedAnnotation,
  onAnnotationSelect,
  onAnnotationDelete,
  onControlAdd,
  onControlRemove,
  onClose,
  autoOpenDetailsId = null,
  onDetailsOpened = null
}) {
  const [showControlPicker, setShowControlPicker] = useState(false);
  const [searchControl, setSearchControl] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [filterByControl, setFilterByControl] = useState('ALL');

  useEffect(() => {
    if (autoOpenDetailsId && selectedAnnotation?.id === autoOpenDetailsId) {
      setShowDetailsModal(true);
      if (onDetailsOpened) onDetailsOpened();
    }
  }, [autoOpenDetailsId]);

  const handleCopyText = (text, annotationId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(annotationId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter annotations by selected control
  const filteredAnnotations = filterByControl === 'ALL'
    ? annotations
    : annotations.filter(annotation =>
        annotation.annotationControls?.some(ac => ac.control.id === filterByControl)
      );

  // Get unique controls that are used in annotations
  const usedControls = [...new Set(
    annotations.flatMap(a => a.annotationControls?.map(ac => ac.control.id) || [])
  )].sort();

  // Filter controls for picker
  const filteredControls = controls.filter(control =>
    control.id.toLowerCase().includes(searchControl.toLowerCase()) ||
    control.title.toLowerCase().includes(searchControl.toLowerCase())
  );

  // Get controls already linked to selected annotation
  const linkedControlIds = selectedAnnotation?.annotationControls?.map(ac => ac.control.id) || [];
  const parsedSummary = parseAiSummary(selectedAnnotation?.parsedSummary || selectedAnnotation?.summary || '');
  const autoDetectedControlId = parsedSummary?.controlId || '';
  const retrievedControlRows = parsedSummary?.retrievedControls || [];

  const handleControlToggle = (controlId) => {
    if (linkedControlIds.includes(controlId)) {
      onControlRemove(selectedAnnotation.id, controlId);
    } else {
      onControlAdd(selectedAnnotation.id, controlId);
    }
  };

  const handleOpenControlPicker = () => {
    if (autoDetectedControlId && !linkedControlIds.includes(autoDetectedControlId)) {
      onControlAdd(selectedAnnotation.id, autoDetectedControlId);
    }
    setShowControlPicker(true);
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            Annotations ({filteredAnnotations.length})
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
            <Filter size={14} />
            Filter by Control
          </label>
          <select
            value={filterByControl}
            onChange={(e) => setFilterByControl(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white cursor-pointer hover:border-cyan-600 transition-all duration-200"
          >
            <option value="ALL">All Annotations ({annotations.length})</option>
            {usedControls.map(controlId => {
              const control = controls.find(c => c.id === controlId);
              const count = annotations.filter(a =>
                a.annotationControls?.some(ac => ac.control.id === controlId)
              ).length;
              return (
                <option key={controlId} value={controlId}>
                  {controlId} - {control?.title || 'Unknown'} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto">
        {annotations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No annotations yet</p>
            <p className="text-xs mt-2">
              Select text in the PDF to create highlights
            </p>
          </div>
        ) : filteredAnnotations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Filter size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No annotations match this filter</p>
            <p className="text-xs mt-2">
              Try selecting a different control
            </p>
            <button
              onClick={() => setFilterByControl('ALL')}
              className="mt-3 px-4 py-2 text-xs bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAnnotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedAnnotation?.id === annotation.id
                    ? 'bg-cyan-50 border-l-4 border-cyan-600'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onAnnotationSelect(annotation)}
              >
                {/* Annotation Content */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: annotation.color || '#FFFF00' }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyText(annotation.content, annotation.id);
                        }}
                        className={`transition-colors ${
                          copiedId === annotation.id
                            ? 'text-green-600'
                            : 'text-gray-400 hover:text-cyan-600'
                        }`}
                        title={copiedId === annotation.id ? 'Copied!' : 'Copy text'}
                      >
                        {copiedId === annotation.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this annotation?')) {
                            onAnnotationDelete(annotation.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete annotation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {annotation.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Page {annotation.pageNumber}
                  </p>
                </div>

                {/* Linked Controls */}
                {annotation.annotationControls && annotation.annotationControls.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {annotation.annotationControls.map((ac) => (
                      <Badge
                        key={ac.id}
                        variant="default"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {ac.control.id}
                        {selectedAnnotation?.id === annotation.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onControlRemove(annotation.id, ac.control.id);
                            }}
                            className="hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons (only for selected annotation) */}
                {selectedAnnotation?.id === annotation.id && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenControlPicker();
                      }}
                      className="flex items-center gap-2 text-xs flex-1"
                    >
                      <Tag size={14} />
                      Tag Control
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2 text-xs flex-1"
                    >
                      <Info size={14} />
                      Details
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Picker Modal */}
      {showControlPicker && selectedAnnotation && (
        <>
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
            onClick={() => setShowControlPicker(false)}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col pointer-events-auto">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Tag Annex A Control</h3>
                  <button
                    onClick={() => setShowControlPicker(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors"
                    title="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search by ID or title... (e.g., A.5.1)"
                  value={searchControl}
                  onChange={(e) => setSearchControl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex-1 grid grid-cols-5 overflow-hidden min-h-0">
                <div className="col-span-2 border-r border-gray-200 overflow-y-auto">
                  {filteredControls.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <p className="text-sm">No controls found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    filteredControls.map((control) => {
                      const isLinked = linkedControlIds.includes(control.id);
                      const isAutoDetected = autoDetectedControlId === control.id;
                      return (
                        <div
                          key={control.id}
                          className={`p-3 border-b border-gray-100 cursor-pointer transition-colors ${
                            isLinked ? 'bg-cyan-50 hover:bg-cyan-100' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleControlToggle(control.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isLinked ? 'border-cyan-600 bg-cyan-600' : 'border-gray-300'
                            }`}>
                              {isLinked && <Check size={10} className="text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-xs text-gray-900">{control.id}</p>
                                {isAutoDetected && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">AI</span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-600 line-clamp-1">{control.title}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="col-span-3 p-4 overflow-y-auto">
                  {linkedControlIds.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase">Tagged Controls</h4>
                      {linkedControlIds.map((cId) => {
                        const ctrl = controls.find((c) => c.id === cId);
                        return (
                          <div key={cId} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm text-gray-900">{cId}</span>
                              <button
                                onClick={() => handleControlToggle(cId)}
                                className="text-xs text-red-500 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{ctrl?.title || 'Unknown'}</p>
                            {ctrl?.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-4">{ctrl.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-sm">Select controls from the left panel</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">
                    {linkedControlIds.length} control(s) selected
                  </span>
                  <span className="text-xs text-gray-500">
                    {filteredControls.length} of {controls.length} shown
                  </span>
                </div>
                <Button
                  variant="primary"
                  onClick={() => setShowControlPicker(false)}
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAnnotation && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 z-40 backdrop-blur-[1px]"
            onClick={() => setShowDetailsModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[86vh] flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Annotation Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden min-h-0">
                {/* LEFT: Source + Evidence */}
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Source Text / Evidence</label>
                    <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 h-48 overflow-y-auto">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedAnnotation.content}</p>
                    </div>
                    <button
                      onClick={() => handleCopyText(selectedAnnotation.content, selectedAnnotation.id)}
                      className={`mt-2 inline-flex items-center gap-1 text-xs transition-colors ${
                        copiedId === selectedAnnotation.id ? 'text-green-600' : 'text-cyan-600 hover:text-cyan-700'
                      }`}
                    >
                      {copiedId === selectedAnnotation.id ? <Check size={14} /> : <Copy size={14} />}
                      {copiedId === selectedAnnotation.id ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">Retrieved Controls</label>
                    <div className="mt-2 p-3 bg-white rounded border border-gray-200 h-56 overflow-y-auto space-y-2">
                      {retrievedControlRows.length > 0 ? (
                        retrievedControlRows.map((row, idx) => {
                          const ctrl = controls.find((c) => c.id === row.id);
                          return (
                            <div key={`${row.id}-${idx}`} className="text-sm text-gray-900 bg-cyan-50 border border-cyan-100 rounded p-2">
                              <span className="font-medium">{row.id}</span>
                              <span className="text-gray-500 ml-2">(score: {Number(row.score).toFixed(4)})</span>
                              {ctrl && (
                                <div className="text-xs text-gray-600 mt-0.5">{ctrl.title}</div>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-gray-500">No retrieved controls.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Structured AI Summary */}
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded border border-cyan-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase">AI Summary</label>
                    {selectedAnnotation.summary && parsedSummary ? (
                      <div className="space-y-3 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="bg-white border border-cyan-100 rounded p-2">
                            <p className="text-[10px] text-gray-500 uppercase">Control ID</p>
                            <p className="text-sm font-semibold text-gray-900">{parsedSummary.controlId || '-'}</p>
                          </div>
                          <div className="bg-white border border-cyan-100 rounded p-2">
                            <p className="text-[10px] text-gray-500 uppercase">Applicable</p>
                            <p className="text-sm font-semibold text-gray-900">{parsedSummary.applicable || '-'}</p>
                          </div>
                          <div className="bg-white border border-cyan-100 rounded p-2">
                            <p className="text-[10px] text-gray-500 uppercase">Implementation Status</p>
                            <p className="text-sm font-semibold text-gray-900">{parsedSummary.implementationStatus || '-'}</p>
                          </div>
                        </div>
                        <div className="bg-white border border-cyan-100 rounded p-2">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Justification</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{parsedSummary.justification || '-'}</p>
                        </div>
                        <div className="bg-white border border-cyan-100 rounded p-2">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Recommendation</p>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{parsedSummary.recommendation || '-'}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-2">AI-generated summary will appear here</p>
                    )}
                  </div>

                  <div className="p-3 bg-white rounded border border-gray-200">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Tag Sync Status</label>
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-700">Auto-detected Control: <span className="font-semibold">{autoDetectedControlId || '-'}</span></p>
                      <p className="text-sm text-gray-700">Tagged Controls: {selectedAnnotation.annotationControls?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <Button
                  variant="primary"
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
