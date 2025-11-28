import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { gaps, getGapsSortedByPriority } from '../data/mockGaps';

export default function GapAnalysis() {
  const [filter, setFilter] = useState('ALL');
  const [expandedGap, setExpandedGap] = useState(null);

  const sortedGaps = getGapsSortedByPriority();
  const filteredGaps = filter === 'ALL'
    ? sortedGaps
    : sortedGaps.filter(gap => gap.priority === filter);

  const priorityCounts = {
    'HIGH': gaps.filter(g => g.priority === 'HIGH').length,
    'MEDIUM': gaps.filter(g => g.priority === 'MEDIUM').length,
    'LOW': gaps.filter(g => g.priority === 'LOW').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gap Analysis</h1>
        <p className="text-gray-500 mt-1.5 text-sm">Compliance Gaps & Recommendations</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{priorityCounts['HIGH']}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{priorityCounts['MEDIUM']}</div>
            <div className="text-sm text-gray-600">Medium Priority</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{priorityCounts['LOW']}</div>
            <div className="text-sm text-gray-600">Low Priority</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
          <button
            key={priority}
            onClick={() => setFilter(priority)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === priority
                ? 'bg-cyan text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {priority === 'ALL' ? 'All Gaps' : `${priority} Priority`}
          </button>
        ))}
      </div>

      {/* Gap List */}
      <div className="space-y-3">
        {filteredGaps.map(gap => (
          <Card key={gap.id} className="transition-all">
            <div
              className="cursor-pointer"
              onClick={() => setExpandedGap(expandedGap === gap.id ? null : gap.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={gap.priority.toLowerCase()} size="md">
                      {gap.priority}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">{gap.controlId}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{gap.controlTitle}</h3>
                  <p className="text-gray-700 mt-1">{gap.problemSummary}</p>
                </div>
                <button className="ml-4 text-gray-400 hover:text-gray-600">
                  {expandedGap === gap.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>

              {expandedGap === gap.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Supporting Evidence</h4>
                    <p className="text-sm text-gray-700">{gap.evidence.findings}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">
                        Documents: {gap.evidence.documents.length || 'None'}
                      </span>
                      <span className="text-gray-600">
                        Interviews: {gap.evidence.interviews.length}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                    <p className="text-gray-700">{gap.aiRecommendation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900">Estimated Effort:</span>
                      <p className="text-gray-700">{gap.estimatedEffort}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Estimated Cost:</span>
                      <p className="text-gray-700">{gap.estimatedCost}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                    <p className="text-gray-700">{gap.impact}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
