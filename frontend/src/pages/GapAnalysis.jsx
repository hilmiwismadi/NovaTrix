import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, Sparkles, FileText, Mic, Target } from 'lucide-react';
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

  const totalGaps = gaps.length;
  const topRisk = sortedGaps[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gap Analysis</h1>
            <p className="text-gray-600 mt-1.5 text-sm">
              Compliance gaps prioritized by impact, with evidence and AI recommendations.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-cyan-100">
            <Sparkles size={16} className="text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-700">Prioritized for remediation planning</span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Total gaps</p>
              <p className="text-3xl font-bold text-gray-900">{totalGaps}</p>
            </div>
            <ShieldAlert className="text-cyan-600" size={24} />
          </div>
        </Card>
        <Card className="p-5 border-red-200 bg-red-50/40">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{priorityCounts.HIGH}</div>
            <div className="text-sm text-gray-700">High Priority</div>
          </div>
        </Card>
        <Card className="p-5 border-orange-200 bg-orange-50/40">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{priorityCounts.MEDIUM}</div>
            <div className="text-sm text-gray-700">Medium Priority</div>
          </div>
        </Card>
        <Card className="p-5 border-gray-300 bg-gray-50/60">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">{priorityCounts.LOW}</div>
            <div className="text-sm text-gray-700">Low Priority</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
          <button
            key={priority}
            onClick={() => setFilter(priority)}
            className={`px-4 py-2 rounded-lg font-medium transition-all border ${
              filter === priority
                ? 'bg-cyan-600 text-white border-cyan-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {priority === 'ALL' ? 'All Gaps' : `${priority} Priority`}
          </button>
        ))}
      </div>

      {topRisk && (
        <Card className="p-5 border-red-200 bg-red-50/40">
          <p className="text-xs uppercase tracking-wide text-red-700 font-semibold mb-1">Top risk now</p>
          <div className="flex items-center gap-2">
            <Badge variant="high">{topRisk.priority}</Badge>
            <span className="text-sm font-semibold text-gray-800">{topRisk.controlId} — {topRisk.controlTitle}</span>
          </div>
          <p className="text-sm text-gray-700 mt-2">{topRisk.problemSummary}</p>
        </Card>
      )}

      {/* Gap List */}
      <div className="space-y-3">
        {filteredGaps.map(gap => (
          <Card key={gap.id} className="transition-all p-5">
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
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <span className="text-gray-600 inline-flex items-center gap-1">
                        <FileText size={14} />
                        Documents: {gap.evidence.documents.length || 'None'}
                      </span>
                      <span className="text-gray-600 inline-flex items-center gap-1">
                        <Mic size={14} />
                        Interviews: {gap.evidence.interviews.length}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI Recommendation</h4>
                    <p className="text-gray-700">{gap.aiRecommendation}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                    <p className="text-gray-700 inline-flex items-start gap-2">
                      <Target size={15} className="text-cyan-600 mt-0.5" />
                      <span>{gap.impact}</span>
                    </p>
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
