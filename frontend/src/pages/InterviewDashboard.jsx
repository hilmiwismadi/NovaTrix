import { useState } from 'react';
import { MessageSquarePlus, User } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { interviews } from '../data/mockInterviews';

export default function InterviewDashboard() {
  const [selectedInterview, setSelectedInterview] = useState(interviews[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Interviews</h1>
          <p className="text-gray-500 mt-1.5 text-sm">Qualitative Evidence Collector</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <MessageSquarePlus size={16} />
          Add New Interview
        </Button>
      </div>

      {/* Interview List & Details */}
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
                  <p className="text-xs text-gray-500 mt-1">{interview.date}</p>
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Maturity</span>
                      <span className="font-semibold">{interview.aiAnalysis.maturityScore}/5</span>
                    </div>
                    <ProgressBar
                      value={interview.aiAnalysis.maturityScore}
                      max={5}
                      showLabel={false}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Interview Details */}
        {selectedInterview && (
          <div className="lg:col-span-2 space-y-4">
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
                  <p className="font-semibold text-gray-900">{selectedInterview.date}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Questions & Answers</h2>
              <div className="space-y-4">
                {selectedInterview.questions.map((q) => (
                  <div key={q.id} className="border-b border-gray-200 pb-4 last:border-0">
                    <p className="font-semibold text-gray-900 mb-2">Q: {q.text}</p>
                    <p className="text-gray-700 mb-2">A: {q.answer}</p>
                    <div className="flex flex-wrap gap-1">
                      {q.annexAMapping.map(control => (
                        <span key={control} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {control}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                  <p className="text-gray-700">{selectedInterview.aiAnalysis.summary}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Key Statements</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {selectedInterview.aiAnalysis.keyStatements.map((statement, idx) => (
                      <li key={idx}>{statement}</li>
                    ))}
                  </ul>
                </div>

                {selectedInterview.aiAnalysis.contradictions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contradictions Detected</h3>
                    <ul className="list-disc list-inside text-orange-700 space-y-1">
                      {selectedInterview.aiAnalysis.contradictions.map((contradiction, idx) => (
                        <li key={idx}>{contradiction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Maturity Score</h3>
                  <div className="flex items-center gap-4">
                    <ProgressBar
                      value={selectedInterview.aiAnalysis.maturityScore}
                      max={5}
                      className="flex-1"
                    />
                    <span className="text-2xl font-bold text-gray-900">
                      {selectedInterview.aiAnalysis.maturityScore}/5
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
