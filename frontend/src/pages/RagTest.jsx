import { useState } from 'react';
import Card from '../components/common/Card';
import apiClient from '../api/client';

export default function RagTest() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState('');
  const [elapsed, setElapsed] = useState(null);
  const [log, setLog] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('API');
  const [model, setModel] = useState('qwen/qwen3-14b:free');

  const runTest = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setResult('');
    setElapsed(null);
    setLog('');

    try {
      const response = await apiClient.post('/ragtest', { query, provider, model });
      setResult(response.data.output || '');
      setElapsed(response.data.processingTimeMs || 0);
      setLog(response.data.detailedLog || 'No detailed log returned.');
      if (response.data.error) setError(response.data.error);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run rag test');
      setLog(err.response?.data ? JSON.stringify(err.response.data, null, 2) : '');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">RAG Test Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Run manual RAG tests and inspect full runtime behavior.</p>
      </div>

      <Card className="p-5 space-y-3">
        <label className="text-sm font-semibold text-gray-800">Query input</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Pipeline</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="API">API (OpenRouter)</option>
              <option value="LOCAL">Local</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Model</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="qwen/qwen3-14b:free"
            />
          </div>
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full min-h-[130px] border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Paste paragraph or query here..."
        />
        <button
          onClick={runTest}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 disabled:opacity-60"
        >
          {isLoading ? 'Processing...' : 'Run RAG Test'}
        </button>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">LLM Output</h2>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result || '-'}</pre>
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Runtime</h2>
          <p className="text-sm text-gray-800">Provider: {provider}</p>
          <p className="text-sm text-gray-800">Elapsed: {elapsed !== null ? `${Math.round(elapsed / 1000)}s (${elapsed} ms)` : '-'}</p>
          {error && <p className="text-sm text-red-600 mt-2">Error: {error}</p>}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Detailed Log</h2>
        <pre className="text-xs text-gray-700 whitespace-pre-wrap max-h-[420px] overflow-auto bg-gray-50 border border-gray-200 rounded p-3">
          {log || '-'}
        </pre>
      </Card>
    </div>
  );
}
