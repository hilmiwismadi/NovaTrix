import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import Button from '../common/Button';
import StepIndicator from '../common/StepIndicator';
import RespondentFormSection from './RespondentFormSection';
import QuestionList from './QuestionList';
import QuestionBankPicker from './QuestionBankPicker';
import useInterviewStore from '../../stores/interviewStore';

const STEPS = ['Respondent', 'Questions', 'Review'];

export default function AddInterviewForm({ isOpen, onClose, onSuccess }) {
  const { createInterview, isLoading, error, clearError } = useInterviewStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    respondentType: 'existing',
    respondentId: null,
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
  const [errors, setErrors] = useState({});
  const [showQuestionBankPicker, setShowQuestionBankPicker] = useState(false);

  if (!isOpen) return null;

  // Validation functions
  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.interviewDate) {
      newErrors.interviewDate = 'Interview date is required';
    }

    if (formData.respondentType === 'existing') {
      if (!formData.respondentId) {
        newErrors.respondentId = 'Please select a respondent';
      }
    } else {
      if (!formData.newRespondent.name.trim()) {
        newErrors.name = 'Respondent name is required';
      }
      if (!formData.newRespondent.role.trim()) {
        newErrors.role = 'Respondent role is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    setCurrentStep(currentStep + 1);
    clearError();
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
    clearError();
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
    setErrors({});
  };

  // Question handlers
  const handleAddFromBank = (selectedQuestions) => {
    const newQuestions = selectedQuestions.map((q) => ({
      questionId: q.id,
      questionText: q.questionText,
      controls: q.targetControls ? JSON.parse(q.targetControls) : []
    }));

    setFormData({
      ...formData,
      questions: [...formData.questions, ...newQuestions]
    });
  };

  const handleAddCustomQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionId: null,
          questionText: '',
          controls: []
        }
      ]
    });
  };

  const handleUpdateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = updatedQuestion;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleDeleteQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const handleReorderQuestion = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= formData.questions.length) return;

    const updatedQuestions = [...formData.questions];
    [updatedQuestions[index], updatedQuestions[newIndex]] = [
      updatedQuestions[newIndex],
      updatedQuestions[index]
    ];
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    const interviewData = {
      respondentId: formData.respondentType === 'existing' ? formData.respondentId : null,
      newRespondent: formData.respondentType === 'new' ? formData.newRespondent : undefined,
      interviewDate: formData.interviewDate,
      questions: formData.questions
    };

    const result = await createInterview(interviewData);

    if (result.success) {
      onSuccess();
      handleClose();
    }
  };

  // Close handler
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      respondentType: 'existing',
      respondentId: null,
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
    setErrors({});
    clearError();
    onClose();
  };

  // Get respondent display name for review
  const getRespondentName = () => {
    if (formData.respondentType === 'existing') {
      return 'Selected respondent';
    }
    return formData.newRespondent.name || 'New respondent';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-glass w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto border border-gray-200/50">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Add New Interview</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pt-6">
            <StepIndicator steps={STEPS} currentStep={currentStep} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Respondent Information */}
            {currentStep === 1 && (
              <RespondentFormSection
                formData={formData}
                onChange={setFormData}
                errors={errors}
              />
            )}

            {/* Step 2: Questions */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Interview Questions</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowQuestionBankPicker(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      From Question Bank
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddCustomQuestion}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Custom Question
                    </Button>
                  </div>
                </div>

                {errors.questions && (
                  <p className="text-sm text-red-500">{errors.questions}</p>
                )}

                <QuestionList
                  questions={formData.questions}
                  onUpdate={handleUpdateQuestion}
                  onDelete={handleDeleteQuestion}
                  onReorder={handleReorderQuestion}
                  showControls={true}
                />
              </div>
            )}

            {/* Step 3: Review */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Review Interview Details</h3>

                {/* Respondent Info */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">Respondent Information</h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditStep(1)}
                    >
                      Edit
                    </Button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-gray-600 font-medium">Name:</dt>
                      <dd className="text-gray-900">
                        {formData.respondentType === 'new'
                          ? formData.newRespondent.name
                          : getRespondentName()}
                      </dd>
                    </div>
                    {formData.respondentType === 'new' && (
                      <>
                        <div>
                          <dt className="text-gray-600 font-medium">Role:</dt>
                          <dd className="text-gray-900">{formData.newRespondent.role}</dd>
                        </div>
                        {formData.newRespondent.division && (
                          <div>
                            <dt className="text-gray-600 font-medium">Division:</dt>
                            <dd className="text-gray-900">{formData.newRespondent.division}</dd>
                          </div>
                        )}
                      </>
                    )}
                    <div>
                      <dt className="text-gray-600 font-medium">Interview Date:</dt>
                      <dd className="text-gray-900">
                        {new Date(formData.interviewDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Questions */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Questions ({formData.questions.length})
                    </h4>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditStep(2)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.questions.map((q, index) => (
                      <div key={index} className="p-3 bg-white rounded border border-gray-200">
                        <div className="flex gap-2">
                          <span className="flex-shrink-0 text-xs font-semibold text-cyan">
                            Q{index + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{q.questionText}</p>
                            {q.controls && q.controls.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {q.controls.map((controlId) => (
                                  <span
                                    key={controlId}
                                    className="text-xs px-2 py-0.5 bg-cyan/10 text-cyan rounded"
                                  >
                                    {controlId}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              {currentStep < 3 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Create Interview
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Bank Picker Modal */}
      <QuestionBankPicker
        isOpen={showQuestionBankPicker}
        onClose={() => setShowQuestionBankPicker(false)}
        onSelect={handleAddFromBank}
        selectedQuestionIds={formData.questions.map((q) => q.questionId).filter(Boolean)}
      />
    </>
  );
}
