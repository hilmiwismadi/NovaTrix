import { Download, Filter } from 'lucide-react';
import { useState } from 'react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { soaEntries } from '../data/mockSOA';

export default function SOAGenerator() {
  const [filter, setFilter] = useState('ALL');

  const filteredEntries = soaEntries.filter(entry => {
    if (filter === 'ALL') return true;
    return entry.implementationStatus === filter;
  });

  const statusCounts = {
    'Implemented': soaEntries.filter(e => e.implementationStatus === 'Implemented').length,
    'Partially Implemented': soaEntries.filter(e => e.implementationStatus === 'Partially Implemented').length,
    'Not Implemented': soaEntries.filter(e => e.implementationStatus === 'Not Implemented').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SOA Generator</h1>
          <p className="text-gray-500 mt-1.5 text-sm">AI-Generated Statement of Applicability</p>
        </div>
        <Button variant="primary" className="flex items-center gap-2" onClick={() => alert('Export functionality - Coming soon')}>
          <Download size={16} />
          Export PDF
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{statusCounts['Implemented']}</div>
            <div className="text-sm text-gray-600">Implemented</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">{statusCounts['Partially Implemented']}</div>
            <div className="text-sm text-gray-600">Partially Implemented</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{statusCounts['Not Implemented']}</div>
            <div className="text-sm text-gray-600">Not Implemented</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['ALL', 'Implemented', 'Partially Implemented', 'Not Implemented'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              filter === status
                ? 'bg-cyan text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* SOA Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Control</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Rationale</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.controlId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{entry.controlId}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{entry.controlTitle}</td>
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        entry.implementationStatus === 'Implemented' ? 'compliant' :
                        entry.implementationStatus === 'Partially Implemented' ? 'partial' :
                        'non-compliant'
                      }
                      size="sm"
                    >
                      {entry.implementationStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-md truncate">
                    {entry.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {filteredEntries.length} of {soaEntries.length} controls
        </div>
      </Card>
    </div>
  );
}
