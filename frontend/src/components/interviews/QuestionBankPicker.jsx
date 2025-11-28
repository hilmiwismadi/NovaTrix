import { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import useInterviewStore from '../../stores/interviewStore';

export default function QuestionBankPicker({ isOpen, onClose, onSelect, selectedQuestionIds = [] }) {
  const { questionBank, fetchQuestionBank } = useInterviewStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchQuestionBank();
      setSelectedIds([]);
    }
  }, [isOpen, fetchQuestionBank]);

  if (!isOpen) return null;

  // Filter questions based on search
  const filteredQuestions = questionBank.filter((q) => {
    const query = searchQuery.toLowerCase();
    return (
      q.questionText.toLowerCase().includes(query) ||
      q.questionCategory?.toLowerCase().includes(query)
    );
  });

  // Toggle selection
  const toggleSelection = (questionId) => {
    setSelectedIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Handle add selected
  const handleAddSelected = () => {
    const selectedQuestions = questionBank.filter((q) => selectedIds.includes(q.id));
    onSelect(selectedQuestions);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-glass w-full max-w-2xl max-h-[80vh] flex flex-col pointer-events-auto border border-gray-200/50">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Select Questions from Bank</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
                title="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md shadow-neumorphic-inset focus:outline-none focus:ring-2 focus:ring-cyan/20 focus:border-cyan text-sm"
                autoFocus
              />
            </div>

            {/* Selection Counter */}
            {selectedIds.length > 0 && (
              <div className="mt-3 text-sm text-cyan font-medium">
                {selectedIds.length} question{selectedIds.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="text-sm">No questions found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              filteredQuestions.map((question) => {
                const isAlreadyAdded = selectedQuestionIds.includes(question.id);
                const isSelected = selectedIds.includes(question.id);

                return (
                  <div
                    key={question.id}
                    className={`
                      p-4 border rounded-lg transition-all cursor-pointer
                      ${isSelected ? 'border-cyan bg-cyan/5' : 'border-gray-200 hover:border-cyan/50'}
                      ${isAlreadyAdded ? 'opacity-50' : ''}
                    `}
                    onClick={() => !isAlreadyAdded && toggleSelection(question.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isAlreadyAdded}
                        onChange={() => {}}
                        className="mt-1 w-4 h-4 text-cyan focus:ring-cyan/20 rounded"
                      />

                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 mb-2">{question.questionText}</p>

                        {/* Category and Controls */}
                        <div className="flex flex-wrap gap-2">
                          {question.questionCategory && (
                            <Badge variant="outline" size="sm">
                              {question.questionCategory}
                            </Badge>
                          )}
                          {question.targetControls && JSON.parse(question.targetControls).map((controlId) => (
                            <Badge key={controlId} variant="default" size="sm">
                              {controlId}
                            </Badge>
                          ))}
                        </div>

                        {isAlreadyAdded && (
                          <p className="text-xs text-gray-500 mt-2">Already added to interview</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddSelected}
              disabled={selectedIds.length === 0}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Add Selected ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
