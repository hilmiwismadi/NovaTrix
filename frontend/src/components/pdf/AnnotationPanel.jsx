// Annotation Panel Component
// Sidebar panel for managing annotations and tagging with controls

import { useState } from 'react';
import { X, Tag, Trash2, Plus, Check } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function AnnotationPanel({
  annotations = [],
  controls = [],
  selectedAnnotation,
  onAnnotationSelect,
  onAnnotationDelete,
  onControlAdd,
  onControlRemove,
  onClose
}) {
  const [showControlPicker, setShowControlPicker] = useState(false);
  const [searchControl, setSearchControl] = useState('');

  // Filter controls for picker
  const filteredControls = controls.filter(control =>
    control.id.toLowerCase().includes(searchControl.toLowerCase()) ||
    control.title.toLowerCase().includes(searchControl.toLowerCase())
  );

  // Get controls already linked to selected annotation
  const linkedControlIds = selectedAnnotation?.annotationControls?.map(ac => ac.control.id) || [];

  const handleControlToggle = (controlId) => {
    if (linkedControlIds.includes(controlId)) {
      onControlRemove(selectedAnnotation.id, controlId);
    } else {
      onControlAdd(selectedAnnotation.id, controlId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">
          Annotations ({annotations.length})
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

      {/* Annotations List */}
      <div className="flex-1 overflow-y-auto">
        {annotations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p className="text-sm">No annotations yet</p>
            <p className="text-xs mt-2">
              Select text in the PDF to create highlights
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {annotations.map((annotation) => (
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

                {/* Add Control Button (only for selected annotation) */}
                {selectedAnnotation?.id === annotation.id && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowControlPicker(!showControlPicker);
                    }}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Tag size={14} />
                    Tag Control
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Control Picker Modal */}
      {showControlPicker && selectedAnnotation && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowControlPicker(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
              {/* Header */}
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

              {/* Controls List */}
              <div className="flex-1 overflow-y-auto">
                {filteredControls.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">No controls found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                ) : (
                  filteredControls.map((control) => {
                    const isLinked = linkedControlIds.includes(control.id);
                    return (
                      <div
                        key={control.id}
                        className={`p-3 border-b border-gray-200 cursor-pointer transition-colors ${
                          isLinked ? 'bg-cyan-50 hover:bg-cyan-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleControlToggle(control.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isLinked ? 'border-cyan-600 bg-cyan-600' : 'border-gray-300'
                          }`}>
                            {isLinked && <Check size={14} className="text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">
                              {control.id}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {control.title}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
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
    </div>
  );
}
