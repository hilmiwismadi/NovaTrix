import { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Tag, X } from 'lucide-react';
import Textarea from '../common/Textarea';
import Badge from '../common/Badge';
import Button from '../common/Button';
import useControlsStore from '../../stores/controlsStore';

export default function QuestionList({ questions, onUpdate, onDelete, onReorder, showControls = true }) {
  const [editingId, setEditingId] = useState(null);
  const [showControlPicker, setShowControlPicker] = useState(null);
  const [searchControl, setSearchControl] = useState('');
  const { controls, fetchControls } = useControlsStore();

  // Fetch controls when control picker is opened
  const handleOpenControlPicker = async (questionIndex) => {
    if (controls.length === 0) {
      await fetchControls();
    }
    setShowControlPicker(questionIndex);
    setSearchControl('');
  };

  // Filter controls based on search
  const filteredControls = controls.filter((control) => {
    const query = searchControl.toLowerCase();
    return (
      control.id.toLowerCase().includes(query) ||
      control.title.toLowerCase().includes(query)
    );
  });

  // Add control to question
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

  // Remove control from question
  const handleRemoveControl = (questionIndex, controlId) => {
    const question = questions[questionIndex];
    onUpdate(questionIndex, {
      ...question,
      controls: question.controls.filter((id) => id !== controlId)
    });
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm">No questions added yet</p>
        <p className="text-xs mt-1">Add questions from the question bank or create custom questions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <div
          key={index}
          className="p-4 border border-gray-200 rounded-lg bg-white hover:border-cyan/30 transition-all"
        >
          <div className="flex items-start gap-3">
            {/* Question Number */}
            <div className="flex-shrink-0 w-8 h-8 bg-cyan/10 rounded-full flex items-center justify-center text-sm font-semibold text-cyan">
              {index + 1}
            </div>

            {/* Question Content */}
            <div className="flex-1 space-y-3">
              {/* Question Text */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Question</label>
                  {editingId === index ? (
                    <Textarea
                      value={question.questionText}
                      onChange={(e) =>
                        onUpdate(index, { ...question, questionText: e.target.value })
                      }
                      rows={2}
                      className="w-full"
                      autoFocus
                      onBlur={() => setEditingId(null)}
                    />
                  ) : (
                    <p
                      className="text-sm text-gray-900 cursor-text p-2 hover:bg-gray-50 rounded"
                      onClick={() => setEditingId(index)}
                    >
                      {question.questionText}
                    </p>
                  )}
                </div>

                {/* Answer Text (if exists in question object) */}
                {question.hasOwnProperty('answerText') && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Answer</label>
                    <Textarea
                      value={question.answerText || ''}
                      onChange={(e) =>
                        onUpdate(index, { ...question, answerText: e.target.value })
                      }
                      rows={2}
                      placeholder="Enter answer (optional)..."
                      className="w-full"
                    />
                  </div>
                )}

                {/* Question Source */}
                {question.questionId && (
                  <p className="text-xs text-gray-500 italic">From question bank</p>
                )}
              </div>

              {/* Controls */}
              {showControls && (
                <div className="space-y-2">
                  {question.controls && question.controls.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {question.controls.map((controlId) => (
                        <Badge
                          key={controlId}
                          variant="default"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          {controlId}
                          <button
                            onClick={() => handleRemoveControl(index, controlId)}
                            className="hover:text-red-600"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenControlPicker(index)}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Tag size={14} />
                    Map to Control
                  </Button>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1">
              {/* Reorder Buttons */}
              <button
                onClick={() => onReorder(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => onReorder(index, 'down')}
                disabled={index === questions.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown size={18} />
              </button>

              {/* Delete Button */}
              <button
                onClick={() => onDelete(index)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded mt-1"
                title="Delete question"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Control Picker Modal */}
      {showControlPicker !== null && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowControlPicker(null)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-glass w-full max-w-lg max-h-[80vh] flex flex-col pointer-events-auto border border-gray-200/50">
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">Map to Annex A Control</h3>
                  <button
                    onClick={() => setShowControlPicker(null)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search by ID or title..."
                  value={searchControl}
                  onChange={(e) => setSearchControl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan"
                  autoFocus
                />
              </div>

              {/* Controls List */}
              <div className="flex-1 overflow-y-auto">
                {filteredControls.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">No controls found</p>
                  </div>
                ) : (
                  filteredControls.map((control) => {
                    const isLinked = questions[showControlPicker]?.controls?.includes(control.id);
                    return (
                      <div
                        key={control.id}
                        onClick={() => !isLinked && handleAddControl(showControlPicker, control.id)}
                        className={`
                          p-4 border-b border-gray-100 cursor-pointer transition-colors
                          ${isLinked ? 'bg-cyan/5' : 'hover:bg-gray-50'}
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold text-sm text-gray-900 mb-1">
                              {control.id}
                            </div>
                            <div className="text-sm text-gray-700">
                              {control.title}
                            </div>
                            <Badge variant="outline" size="sm" className="mt-2">
                              {control.category}
                            </Badge>
                          </div>
                          {isLinked && (
                            <Badge variant="default" size="sm">
                              Linked
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
