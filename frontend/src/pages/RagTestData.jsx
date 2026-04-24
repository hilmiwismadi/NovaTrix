import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import apiClient from '../api/client';

export default function RagTestData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCells, setExpandedCells] = useState(new Set());
  const [copiedLogId, setCopiedLogId] = useState(null);

  const toggleCellExpansion = (rowId, field) => {
    const key = `${rowId}-${field}`;
    setExpandedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isCellExpanded = (rowId, field) => expandedCells.has(`${rowId}-${field}`);

  const parseTiming = (detailedLog) => {
    if (!detailedLog) return null;
    try {
      const parsed = JSON.parse(detailedLog);
      return parsed.timing || null;
    } catch {
      const match = detailedLog.match(/"timing"\s*:\s*(\{[^}]+\})/);
      if (match) {
        try { return JSON.parse(match[1]); } catch { return null; }
      }
      return null;
    }
  };

  const copyLog = async (rowId, log) => {
    await navigator.clipboard.writeText(log || '');
    setCopiedLogId(rowId);
    setTimeout(() => setCopiedLogId(null), 1500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get('/ragtest/data');
        setRows(response.data.runs || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load rag test data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RAG Test Data</h1>
        <p className="text-sm text-gray-600 mt-1">Historical table of all RAG test runs.</p>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">{error}</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[1200px] table-fixed text-sm">
              <colgroup>
                <col className="w-[140px]" />
                <col className="w-[180px]" />
                <col className="w-[90px]" />
                <col className="w-[90px]" />
                <col className="w-[320px]" />
                <col className="w-[380px]" />
                <col className="w-[220px]" />
              </colgroup>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Provider API</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Duration</th>
                  <th className="text-left p-3">Query</th>
                  <th className="text-left p-3">Output/Error</th>
                  <th className="text-left p-3">Detailed Log</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 align-top">
                    <td className="p-3">
                      <div className="text-xs text-gray-800 leading-tight">{new Date(r.createdAt).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-500 leading-tight mt-1">{new Date(r.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-3 text-xs">
                      <div className="overflow-hidden text-ellipsis" title={r.provider || '-'}>{r.provider || '-'}</div>
                      {r.model && <div className="text-[11px] text-gray-500 mt-0.5 overflow-hidden text-ellipsis" title={r.model}>{r.model}</div>}
                    </td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.status}</td>
                    <td className="p-3 text-xs">
                      <div className="font-medium">{r.processingTimeMs ? `${Math.round(r.processingTimeMs / 1000)}s (${r.processingTimeMs} ms)` : '-'}</div>
                      {(() => {
                        const timing = parseTiming(r.detailedLog);
                        if (!timing) return null;
                        return (
                          <div className="mt-1.5 text-[11px] text-gray-500 space-y-0.5 border-t border-gray-100 pt-1.5">
                            <p>T_retrieval: {(timing.T_retrieval_ms / 1000).toFixed(1)}s</p>
                            <p>T_generation: {(timing.T_generation_ms / 1000).toFixed(1)}s</p>
                            <p className="font-medium text-gray-700">T_total: {(timing.T_total_ms / 1000).toFixed(1)}s</p>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <div
                          className={`whitespace-pre-wrap text-sm text-gray-700 ${!isCellExpanded(r.id, 'query') ? 'line-clamp-5' : ''}`}
                        >
                          {r.queryText || '-'}
                        </div>
                        {r.queryText && r.queryText.length > 220 && !isCellExpanded(r.id, 'query') && (
                          <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                        {r.queryText && r.queryText.length > 220 && (
                          <button
                            onClick={() => toggleCellExpansion(r.id, 'query')}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-white/95 backdrop-blur-sm hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 z-10 ${
                              !isCellExpanded(r.id, 'query') ? 'absolute bottom-1 right-1' : 'mt-2'
                            }`}
                          >
                            <span>{isCellExpanded(r.id, 'query') ? '▲' : '▼'}</span>
                            {isCellExpanded(r.id, 'query') ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="relative">
                        <div
                          className={`whitespace-pre-wrap text-sm text-gray-700 ${!isCellExpanded(r.id, 'output') ? 'line-clamp-6' : ''}`}
                        >
                          {r.outputText || r.errorMessage || '-'}
                        </div>
                        {(r.outputText || r.errorMessage) && (r.outputText || r.errorMessage).length > 260 && !isCellExpanded(r.id, 'output') && (
                          <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                        {(r.outputText || r.errorMessage) && (r.outputText || r.errorMessage).length > 260 && (
                          <button
                            onClick={() => toggleCellExpansion(r.id, 'output')}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-white/95 backdrop-blur-sm hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 z-10 ${
                              !isCellExpanded(r.id, 'output') ? 'absolute bottom-1 right-1' : 'mt-2'
                            }`}
                          >
                            <span>{isCellExpanded(r.id, 'output') ? '▲' : '▼'}</span>
                            {isCellExpanded(r.id, 'output') ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-2">
                        <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2 max-h-28 overflow-hidden">
                          {r.detailedLog || '-'}
                        </pre>
                        <button
                          onClick={() => copyLog(r.id, r.detailedLog || '')}
                          className="text-xs px-2 py-1 rounded border border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                        >
                          {copiedLogId === r.id ? 'Copied' : 'Copy Log'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
