// SOATable.jsx
// Statement of Applicability Table with ISO 27001:2022 Annex A Controls

import { useState, useEffect } from 'react';
import useSOAStore from '../stores/soaStore';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EvidenceModal from '../components/soa/EvidenceModal';
import { Search, Loader2, ChevronLeft, ChevronRight, Link as LinkIcon } from 'lucide-react';

// Category configuration for pagination
const CATEGORY_PAGES = [
  { id: 1, key: 'ORGANIZATIONAL', label: 'A.5 - Organizational Controls', shortLabel: 'A.5' },
  { id: 2, key: 'PEOPLE', label: 'A.6 - People Controls', shortLabel: 'A.6' },
  { id: 3, key: 'PHYSICAL', label: 'A.7 - Physical Controls', shortLabel: 'A.7' },
  { id: 4, key: 'TECHNOLOGICAL', label: 'A.8 - Technological Controls', shortLabel: 'A.8' }
];

// Applicability options
const APPLICABILITY_OPTIONS = [
  { value: 'applicable', label: 'Yes' },
  { value: 'not-applicable', label: 'No' },
  { value: 'not-determined', label: 'To Be Determined' }
];

// Implementation status options
const STATUS_OPTIONS = [
  { value: 'implemented', label: 'Implemented' },
  { value: 'partially-implemented', label: 'Partially Implemented' },
  { value: 'not-implemented', label: 'Not Implemented' },
  { value: 'planned', label: 'Planned' }
];

export default function SOATable() {
  // Store
  const {
    entries,
    isLoading,
    error,
    fetchSOAEntries,
    updateSOAEntry
  } = useSOAStore();

  // Local state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { entryId, field }
  const [editValue, setEditValue] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState(null);

  // Fetch SOA entries on mount
  useEffect(() => {
    fetchSOAEntries();
  }, [fetchSOAEntries]);

  // Get current category configuration
  const currentCategory = CATEGORY_PAGES.find(cat => cat.id === currentPage);

  // Filter entries by current category and search term
  const filteredEntries = entries.filter(entry => {
    const matchesCategory = entry.control?.category === currentCategory?.key;
    const matchesSearch = searchTerm === '' ||
      entry.control?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.control?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle cell edit start
  const handleEditStart = (entryId, field, currentValue) => {
    setEditingCell({ entryId, field });
    setEditValue(currentValue || '');
  };

  // Handle cell edit save
  const handleEditSave = async (entryId, field) => {
    if (editingCell?.entryId === entryId && editingCell?.field === field) {
      await updateSOAEntry(entryId, { [field]: editValue });
      setEditingCell(null);
      setEditValue('');
    }
  };

  // Handle select change (immediate save)
  const handleSelectChange = async (entryId, field, value) => {
    await updateSOAEntry(entryId, { [field]: value });
  };

  // Handle evidence modal
  const handleShowEvidence = (controlId) => {
    setSelectedControlId(controlId);
    setShowEvidenceModal(true);
  };

  const handleCloseEvidence = () => {
    setShowEvidenceModal(false);
    setSelectedControlId(null);
  };

  // Get badge color for category
  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case 'ORGANIZATIONAL': return 'bg-blue-100 text-blue-800';
      case 'PEOPLE': return 'bg-purple-100 text-purple-800';
      case 'PHYSICAL': return 'bg-green-100 text-green-800';
      case 'TECHNOLOGICAL': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get display label for applicability
  const getApplicabilityLabel = (value) => {
    const option = APPLICABILITY_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  // Get display label for status
  const getStatusLabel = (value) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === value);
    return option?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statement of Applicability</h1>
          <p className="text-gray-600 mt-1">ISO 27001:2022 Annex A Controls</p>
        </div>
      </div>

      {/* Category Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {CATEGORY_PAGES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCurrentPage(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                currentPage === cat.id
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-soft'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-600 hover:text-cyan-600'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {CATEGORY_PAGES.length}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage(prev => Math.min(CATEGORY_PAGES.length, prev + 1))}
            disabled={currentPage === CATEGORY_PAGES.length}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Current Category Label */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-900">{currentCategory?.label}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showing {filteredEntries.length} control{filteredEntries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          type="text"
          placeholder="Search by Control ID or Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-600" size={40} />
          <span className="ml-3 text-gray-600">Loading SOA entries...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <p className="text-red-800">Error: {error}</p>
        </Card>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 w-24">
                    Control ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 w-64">
                    Control Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 w-32">
                    Applicability
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 w-80">
                    Justification
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 w-48">
                    Status of Implementation
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">
                    Implementation Method
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No controls found. {searchTerm && 'Try adjusting your search.'}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map(entry => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {/* Control ID - Read-only */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryBadgeColor(entry.control?.category)}`}>
                          {entry.control?.id}
                        </span>
                      </td>

                      {/* Control Name - Read-only */}
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {entry.control?.title}
                        </span>
                      </td>

                      {/* Applicability - Select Dropdown */}
                      <td className="py-2 px-4">
                        <Select
                          value={entry.applicability || 'not-determined'}
                          onChange={(e) => handleSelectChange(entry.id, 'applicability', e.target.value)}
                          options={APPLICABILITY_OPTIONS}
                          className="w-full text-sm"
                        />
                      </td>

                      {/* Justification - Editable Textarea */}
                      <td className="py-2 px-4">
                        {editingCell?.entryId === entry.id && editingCell?.field === 'justification' ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(entry.id, 'justification')}
                            rows={2}
                            className="w-full text-sm"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => handleEditStart(entry.id, 'justification', entry.justification)}
                            className="min-h-[2.5rem] text-sm text-gray-600 cursor-pointer hover:bg-cyan-50 p-2 rounded transition-colors"
                          >
                            {entry.justification || (
                              <span className="text-gray-400 italic">Click to add...</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Implementation Status - Select Dropdown */}
                      <td className="py-2 px-4">
                        <Select
                          value={entry.implementationStatus || 'not-implemented'}
                          onChange={(e) => handleSelectChange(entry.id, 'implementationStatus', e.target.value)}
                          options={STATUS_OPTIONS}
                          className="w-full text-sm"
                        />
                      </td>

                      {/* Implementation Method - Editable Textarea + Evidence Badge */}
                      <td className="py-2 px-4">
                        <div className="flex items-start gap-2">
                          {editingCell?.entryId === entry.id && editingCell?.field === 'implementationMethod' ? (
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleEditSave(entry.id, 'implementationMethod')}
                              rows={2}
                              className="flex-1 text-sm"
                              autoFocus
                            />
                          ) : (
                            <div
                              onClick={() => handleEditStart(entry.id, 'implementationMethod', entry.implementationMethod)}
                              className="flex-1 min-h-[2.5rem] text-sm text-gray-600 cursor-pointer hover:bg-cyan-50 p-2 rounded transition-colors"
                            >
                              {entry.implementationMethod || (
                                <span className="text-gray-400 italic">Click to add...</span>
                              )}
                            </div>
                          )}

                          {/* Evidence Badge */}
                          {entry.evidenceSummary && (
                            entry.evidenceSummary.documents?.length > 0 ||
                            entry.evidenceSummary.interviews?.length > 0
                          ) && (
                            <button
                              onClick={() => handleShowEvidence(entry.control.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded hover:bg-cyan-200 transition-colors whitespace-nowrap"
                              title="View evidence"
                            >
                              <LinkIcon size={14} />
                              {(entry.evidenceSummary.documents?.length || 0) +
                               (entry.evidenceSummary.interviews?.length || 0)}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Evidence Modal */}
      <EvidenceModal
        controlId={selectedControlId}
        isOpen={showEvidenceModal}
        onClose={handleCloseEvidence}
      />
    </div>
  );
}
