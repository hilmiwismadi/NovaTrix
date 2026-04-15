import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
  X
} from 'lucide-react';

const statusMeta = {
  indexing: { label: 'Retrieving context', icon: Loader2, color: 'text-blue-600' },
  generating: { label: 'Generating answer', icon: Loader2, color: 'text-purple-600' },
  saving: { label: 'Saving annotation', icon: Loader2, color: 'text-cyan-600' },
  done: { label: 'Saved', icon: CheckCircle2, color: 'text-green-600' },
  error: { label: 'Failed', icon: AlertCircle, color: 'text-red-600' }
};

function JobCard({ job, expanded, onToggleExpand, nowTs }) {
  const meta = statusMeta[job.state] || statusMeta.indexing;
  const Icon = meta.icon;
  const elapsed = job.state === 'done' || job.state === 'error'
    ? Math.round((job.elapsedMs || 0) / 1000)
    : Math.round(((nowTs || job.startedAt) - job.startedAt) / 1000);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onToggleExpand(job.id)}
        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
      >
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Page {job.pageNumber}</p>
          <p className="text-sm text-gray-800 truncate">{job.text}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          {job.state === 'indexing' || job.state === 'generating' || job.state === 'saving'
            ? <Icon size={14} className={`${meta.color} animate-spin`} />
            : <Icon size={14} className={meta.color} />}
          {expanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </button>

      {expanded && (
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${meta.color}`}>{meta.label}</span>
            <span className="text-xs text-gray-600 flex items-center gap-1">
              <Clock3 size={12} />
              {elapsed}s
            </span>
          </div>
          {job.error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">{job.error}</p>}
          {job.response && <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2 max-h-40 overflow-auto">{job.response}</pre>}
        </div>
      )}
    </div>
  );
}

export default function DocumentRAGSidebar({ isOpen, onClose, jobs = [], nowTs = 0 }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedIds, setExpandedIds] = useState({});
  const activeCount = useMemo(() => jobs.filter((j) => ['indexing', 'generating', 'saving'].includes(j.state)).length, [jobs]);

  if (!isOpen) return null;

  return (
    <aside className={`absolute right-4 top-4 z-20 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${isMinimized ? 'w-[320px]' : 'w-[400px] bottom-4'}`}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-cyan-600" />
          <h3 className="text-sm font-semibold text-gray-900">RAG Assistant</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">{jobs.length}</span>
          {activeCount > 0 && <span className="text-xs text-blue-600">{activeCount} running</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized((v) => !v)}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label={isMinimized ? 'Expand RAG sidebar' : 'Minimize RAG sidebar'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label="Close RAG sidebar"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 space-y-3 h-[calc(100%-52px)] overflow-y-auto">
          {jobs.length === 0 && <p className="text-sm text-gray-500">No RAG jobs yet.</p>}
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              expanded={expandedIds[job.id] ?? (job.state !== 'done')}
              onToggleExpand={(id) => setExpandedIds((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }))}
              nowTs={nowTs}
            />
          ))}
        </div>
      )}
    </aside>
  );
}
