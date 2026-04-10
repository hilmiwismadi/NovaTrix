import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import apiClient from '../api/client';

export default function RagTestData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCells, setExpandedCells] = useState(new Set());

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
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Provider</th>
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
                    <td className="p-3 whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-3 whitespace-nowrap">{r.provider || '-'}</td>
                    <td className="p-3">{r.status}</td>
                    <td className="p-3 whitespace-nowrap">{r.processingTimeMs ? `${Math.round(r.processingTimeMs / 1000)}s` : '-'}</td>
                    <td className="p-3 max-w-[420px]">
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
                    <td className="p-3 max-w-[520px]">
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
                    <td className="p-3 max-w-[520px]">
                      <div className="relative">
                        <pre
                          className={`text-xs whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded p-2 ${!isCellExpanded(r.id, 'log') ? 'line-clamp-6' : ''}`}
                        >
                          {r.detailedLog || '-'}
                        </pre>
                        {r.detailedLog && r.detailedLog.length > 260 && !isCellExpanded(r.id, 'log') && (
                          <div className="absolute bottom-0 right-0 left-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                        {r.detailedLog && r.detailedLog.length > 260 && (
                          <button
                            onClick={() => toggleCellExpansion(r.id, 'log')}
                            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-white/95 backdrop-blur-sm hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 z-10 ${
                              !isCellExpanded(r.id, 'log') ? 'absolute bottom-1 right-1' : 'mt-2'
                            }`}
                          >
                            <span>{isCellExpanded(r.id, 'log') ? '▲' : '▼'}</span>
                            {isCellExpanded(r.id, 'log') ? 'Read Less' : 'Read More'}
                          </button>
                        )}
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
