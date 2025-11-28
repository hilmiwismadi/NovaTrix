import { useState, useEffect } from 'react';
import { MessageSquarePlus, User, Edit, Trash2, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import AddInterviewForm from '../components/interviews/AddInterviewForm';
import EditInterviewForm from '../components/interviews/EditInterviewForm';
import useInterviewStore from '../stores/interviewStore';

export default function InterviewDashboard() {
  const { interviews, isLoading, deleteInterview, fetchInterviews, fetchInterviewById } = useInterviewStore();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [interviewToDelete, setInterviewToDelete] = useState(null);
  const [interviewToEdit, setInterviewToEdit] = useState(null);

  // Fetch interviews on mount
  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Set first interview as selected when interviews load
  useEffect(() => {
    if (interviews.length > 0 && !selectedInterview) {
      setSelectedInterview(interviews[0]);
    }
  }, [interviews, selectedInterview]);

  // Handle delete
  const handleDeleteClick = (interview) => {
    setInterviewToDelete(interview);
    setIsDeleteModalOpen(true);
  };

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

  // Handle edit
  const handleEditClick = async (interview) => {
    // Fetch full interview details including Q&A
    const result = await fetchInterviewById(interview.id);
    if (result.success) {
      setInterviewToEdit(result.data);
      setIsEditModalOpen(true);
    }
  };

  const handleEditSuccess = () => {
    fetchInterviews();
    if (selectedInterview) {
      fetchInterviewById(selectedInterview.id).then(result => {
        if (result.success) {
          setSelectedInterview(result.data);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interviews</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Qualitative Evidence Collector</p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setIsAddModalOpen(true)}
        >
          <MessageSquarePlus size={16} />
          Add New Interview
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && interviews.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-cyan border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4">Loading interviews...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && interviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquarePlus size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Interviews Yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first interview</p>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 mx-auto"
          >
            <MessageSquarePlus size={16} />
            Add New Interview
          </Button>
        </div>
      )}

      {/* Interview List & Details */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interview List */}
          <div className="lg:col-span-1 space-y-3">
            {interviews.map((interview) => (
            <Card
              key={interview.id}
              hoverable
              onClick={() => setSelectedInterview(interview)}
              className={selectedInterview?.id === interview.id ? 'ring-2 ring-cyan/60 border-cyan/30' : ''}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-cyan/10 rounded-full flex items-center justify-center border border-cyan/30">
                  <User size={20} className="text-cyan" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{interview.respondent.name}</h3>
                  <p className="text-sm text-gray-600">{interview.respondent.role}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(interview.interviewDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {interview.aiMaturityScore !== null && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-gray-600">Maturity</span>
                        <span className="font-semibold">{interview.aiMaturityScore}/5</span>
                      </div>
                      <ProgressBar
                        value={interview.aiMaturityScore}
                        max={5}
                        showLabel={false}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Interview Details */}
        {selectedInterview && (
          <div className="lg:col-span-2 space-y-4">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditClick(selectedInterview)}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeleteClick(selectedInterview)}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </div>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Respondent Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-900">{selectedInterview.respondent.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <p className="font-semibold text-gray-900">{selectedInterview.respondent.role}</p>
                </div>
                <div>
                  <span className="text-gray-600">Division:</span>
                  <p className="font-semibold text-gray-900">{selectedInterview.respondent.division}</p>
                </div>
                <div>
                  <span className="text-gray-600">Interview Date:</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedInterview.interviewDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Questions & Answers</h2>
              <div className="space-y-4">
                {selectedInterview.interviewQA && selectedInterview.interviewQA.length > 0 ? (
                  selectedInterview.interviewQA.map((qa, index) => (
                    <div key={qa.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <p className="font-semibold text-gray-900 mb-2">Q{index + 1}: {qa.questionText}</p>
                      {qa.answerText ? (
                        <p className="text-gray-700 mb-2">A: {qa.answerText}</p>
                      ) : (
                        <p className="text-gray-500 italic mb-2">Answer pending</p>
                      )}
                      {qa.interviewQAControls && qa.interviewQAControls.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {qa.interviewQAControls.map(qac => (
                            <span key={qac.id} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                              {qac.control.id}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No questions added yet</p>
                )}
              </div>
            </Card>

            {selectedInterview.aiSummary && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700">{selectedInterview.aiSummary}</p>
                  </div>

                  {selectedInterview.aiKeyStatements && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Key Statements</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {JSON.parse(selectedInterview.aiKeyStatements).map((statement, idx) => (
                          <li key={idx}>{statement}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedInterview.aiContradictions && JSON.parse(selectedInterview.aiContradictions).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contradictions Detected</h3>
                      <ul className="list-disc list-inside text-orange-700 space-y-1">
                        {JSON.parse(selectedInterview.aiContradictions).map((contradiction, idx) => (
                          <li key={idx}>{contradiction}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedInterview.aiMaturityScore !== null && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Maturity Score</h3>
                      <div className="flex items-center gap-4">
                        <ProgressBar
                          value={selectedInterview.aiMaturityScore}
                          max={5}
                          className="flex-1"
                        />
                        <span className="text-2xl font-bold text-gray-900">
                          {selectedInterview.aiMaturityScore}/5
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {!selectedInterview.aiSummary && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
                <p className="text-gray-500 text-sm">AI analysis will be available after the interview is completed and analyzed.</p>
              </Card>
            )}
          </div>
        )}
      </div>
      )}

      {/* Add Interview Modal */}
      <AddInterviewForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchInterviews();
        }}
      />

      {/* Edit Interview Modal */}
      <EditInterviewForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setInterviewToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        interview={interviewToEdit}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-glass w-full max-w-md pointer-events-auto border border-gray-200/50">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="text-red-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Interview</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Are you sure you want to delete the interview with{' '}
                      <span className="font-semibold">{interviewToDelete?.respondent.name}</span>?
                      This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleDeleteConfirm}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
