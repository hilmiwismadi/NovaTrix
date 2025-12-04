// SOATable.jsx
// Statement of Applicability Table with ISO 27001:2022 Annex A Controls

import { useState, useEffect, useRef } from 'react';
import useSOAStore from '../stores/soaStore';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EvidenceModal from '../components/soa/EvidenceModal';
import { Search, Loader2, ChevronLeft, ChevronRight, Link as LinkIcon, Filter, ChevronDown } from 'lucide-react';

// Category configuration for pagination
const CATEGORY_PAGES = [
  { id: 0, key: null, label: 'All Annex A Controls', shortLabel: 'All' },
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
  { value: 'planned', label: 'Planned' },
  { value: 'to-be-determined', label: 'To Be Determined' }
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
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { entryId, field }
  const [editValue, setEditValue] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedControlId, setSelectedControlId] = useState(null);
  const [expandedCells, setExpandedCells] = useState(new Set()); // Track expanded cells

  // Filter state
  const [selectedApplicabilityFilters, setSelectedApplicabilityFilters] = useState([]);
  const [selectedStatusFilters, setSelectedStatusFilters] = useState([]);
  const [showApplicabilityDropdown, setShowApplicabilityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Refs for dropdown
  const applicabilityDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Fetch SOA entries on mount
  useEffect(() => {
    fetchSOAEntries();
  }, [fetchSOAEntries]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (applicabilityDropdownRef.current && !applicabilityDropdownRef.current.contains(event.target)) {
        setShowApplicabilityDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current category configuration
  const currentCategory = CATEGORY_PAGES.find(cat => cat.id === currentPage);

  // Filter entries by current category, search term, and filters
  const filteredEntries = entries.filter(entry => {
    const matchesCategory = currentPage === 0 || entry.control?.category === currentCategory?.key;
    const matchesSearch = searchTerm === '' ||
      entry.control?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.control?.title?.toLowerCase().includes(searchTerm.toLowerCase());

    // Applicability filter
    const matchesApplicability = selectedApplicabilityFilters.length === 0 ||
      selectedApplicabilityFilters.includes(entry.applicability || 'not-determined');

    // Status filter
    const matchesStatus = selectedStatusFilters.length === 0 ||
      selectedStatusFilters.includes(entry.implementationStatus || 'not-implemented');

    return matchesCategory && matchesSearch && matchesApplicability && matchesStatus;
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
    // Close the editing cell after save
    if (field === 'implementationStatus' || field === 'applicability') {
      setEditingCell(null);
    }
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

  // Handle cell expansion toggle (specific to column and row)
  const toggleCellExpansion = (entryId, field) => {
    const cellKey = `${entryId}-${field}`;
    setExpandedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  };

  // Check if a specific cell is expanded
  const isCellExpanded = (entryId, field) => {
    return expandedCells.has(`${entryId}-${field}`);
  };

  // Toggle filter selection
  const toggleApplicabilityFilter = (value) => {
    setSelectedApplicabilityFilters(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const toggleStatusFilter = (value) => {
    setSelectedStatusFilters(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Clear filters
  const clearApplicabilityFilters = () => setSelectedApplicabilityFilters([]);
  const clearStatusFilters = () => setSelectedStatusFilters([]);

  // Select all filters
  const selectAllApplicabilityFilters = () => {
    setSelectedApplicabilityFilters(APPLICABILITY_OPTIONS.map(opt => opt.value));
  };
  const selectAllStatusFilters = () => {
    setSelectedStatusFilters(STATUS_OPTIONS.map(opt => opt.value));
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

  // Get badge variant for implementation status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'implemented':
        return 'compliant';
      case 'not-implemented':
        return 'non-compliant';
      case 'partially-implemented':
        return 'partial';
      case 'planned':
        return 'analyzed';
      case 'to-be-determined':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get badge variant for applicability
  const getApplicabilityBadgeVariant = (applicability) => {
    switch (applicability) {
      case 'applicable':
        return 'compliant';
      case 'not-applicable':
        return 'non-compliant';
      case 'not-determined':
        return 'default';
      default:
        return 'default';
    }
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

      {/* Category Pagination and Filters */}
      <div className="flex items-center justify-between gap-4">
        {/* Category Buttons */}
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

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Applicability Filter */}
          <div className="relative" ref={applicabilityDropdownRef}>
            <button
              onClick={() => setShowApplicabilityDropdown(!showApplicabilityDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                selectedApplicabilityFilters.length > 0
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-600'
              }`}
            >
              <Filter size={16} />
              Applicability
              {selectedApplicabilityFilters.length > 0 && (
                <span className="bg-white text-cyan-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedApplicabilityFilters.length}
                </span>
              )}
              <ChevronDown size={16} />
            </button>

            {showApplicabilityDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Filter by Applicability</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllApplicabilityFilters}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Select All
                    </button>
                    {selectedApplicabilityFilters.length > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={clearApplicabilityFilters}
                          className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          Clear All
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {APPLICABILITY_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedApplicabilityFilters.includes(option.value)}
                        onChange={() => toggleApplicabilityFilter(option.value)}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                selectedStatusFilters.length > 0
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-600'
              }`}
            >
              <Filter size={16} />
              Status of Implementation
              {selectedStatusFilters.length > 0 && (
                <span className="bg-white text-cyan-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedStatusFilters.length}
                </span>
              )}
              <ChevronDown size={16} />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Filter by Status</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={selectAllStatusFilters}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Select All
                    </button>
                    {selectedStatusFilters.length > 0 && (
                      <>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={clearStatusFilters}
                          className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                          Clear All
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {STATUS_OPTIONS.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatusFilters.includes(option.value)}
                        onChange={() => toggleStatusFilter(option.value)}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '7%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '26%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Control ID
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Control Name
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Applicability
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Justification
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
                    Status of Implementation
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">
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
                      <td className="py-4 px-4 align-top">
                        <span className="text-sm font-medium text-gray-900">
                          {entry.control?.id}
                        </span>
                      </td>

                      {/* Control Name - Read-only */}
                      <td className="py-4 px-4 align-top">
                        <span className="text-sm font-medium text-gray-900">
                          {entry.control?.title}
                        </span>
                      </td>

                      {/* Applicability - Click to Edit */}
                      <td className="py-4 px-4 align-top">
                        {editingCell?.entryId === entry.id && editingCell?.field === 'applicability' ? (
                          <Select
                            value={entry.applicability || 'not-determined'}
                            onChange={(e) => handleSelectChange(entry.id, 'applicability', e.target.value)}
                            options={APPLICABILITY_OPTIONS}
                            className="w-full text-sm border-cyan-500 focus:border-cyan-600"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => handleEditStart(entry.id, 'applicability', entry.applicability)}
                            className="cursor-pointer hover:bg-cyan-50 p-2 rounded transition-colors inline-block"
                          >
                            <Badge
                              variant={getApplicabilityBadgeVariant(entry.applicability || 'not-determined')}
                              size="sm"
                            >
                              {getApplicabilityLabel(entry.applicability || 'not-determined')}
                            </Badge>
                          </div>
                        )}
                      </td>

                      {/* Justification - Editable Textarea */}
                      <td className="py-4 px-4 align-top">
                        {editingCell?.entryId === entry.id && editingCell?.field === 'justification' ? (
                          <Textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(entry.id, 'justification')}
                            rows={3}
                            className="w-full text-sm border-cyan-500 focus:border-cyan-600"
                            autoFocus
                          />
                        ) : (
                          <div className="relative">
                            <div
                              onClick={() => handleEditStart(entry.id, 'justification', entry.justification)}
                              className={`text-sm text-gray-700 cursor-pointer hover:bg-cyan-50 p-2 rounded border border-transparent hover:border-cyan-300 transition-all duration-300 ${
                                !isCellExpanded(entry.id, 'justification') ? 'line-clamp-5' : ''
                              }`}
                              style={{
                                transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out'
                              }}
                            >
                              {entry.justification || (
                                <span className="text-gray-400 italic">Click to add...</span>
                              )}
                            </div>
                            {entry.justification && entry.justification.length > 200 && !isCellExpanded(entry.id, 'justification') && (
                              <div className="absolute bottom-0 right-0 left-0 h-12 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                            )}
                            {entry.justification && entry.justification.length > 200 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCellExpansion(entry.id, 'justification');
                                }}
                                className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-white/95 backdrop-blur-sm hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 z-10 ${
                                  !isCellExpanded(entry.id, 'justification')
                                    ? 'absolute bottom-2 right-2'
                                    : 'mt-2'
                                }`}
                              >
                                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                                  {isCellExpanded(entry.id, 'justification') ? '▲' : '▼'}
                                </span>
                                {isCellExpanded(entry.id, 'justification') ? 'Read Less' : 'Read More'}
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Implementation Status - Click to Edit */}
                      <td className="py-4 px-4 align-top">
                        {editingCell?.entryId === entry.id && editingCell?.field === 'implementationStatus' ? (
                          <Select
                            value={entry.implementationStatus || 'not-implemented'}
                            onChange={(e) => handleSelectChange(entry.id, 'implementationStatus', e.target.value)}
                            options={STATUS_OPTIONS}
                            className="w-full text-sm border-cyan-500 focus:border-cyan-600"
                            autoFocus
                          />
                        ) : (
                          <div
                            onClick={() => handleEditStart(entry.id, 'implementationStatus', entry.implementationStatus)}
                            className="cursor-pointer hover:bg-cyan-50 p-2 rounded transition-colors inline-block"
                          >
                            <Badge
                              variant={getStatusBadgeVariant(entry.implementationStatus || 'not-implemented')}
                              size="sm"
                            >
                              {getStatusLabel(entry.implementationStatus || 'not-implemented')}
                            </Badge>
                          </div>
                        )}
                      </td>

                      {/* Implementation Method - Editable Textarea + Evidence Badge */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 relative">
                            {editingCell?.entryId === entry.id && editingCell?.field === 'implementationMethod' ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleEditSave(entry.id, 'implementationMethod')}
                                rows={3}
                                className="w-full text-sm border-cyan-500 focus:border-cyan-600"
                                autoFocus
                              />
                            ) : (
                              <>
                                <div
                                  onClick={() => handleEditStart(entry.id, 'implementationMethod', entry.implementationMethod)}
                                  className={`text-sm text-gray-700 cursor-pointer hover:bg-cyan-50 p-2 rounded border border-transparent hover:border-cyan-300 transition-all duration-300 ${
                                    !isCellExpanded(entry.id, 'implementationMethod') ? 'line-clamp-5' : ''
                                  }`}
                                  style={{
                                    transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out'
                                  }}
                                >
                                  {entry.implementationMethod || (
                                    <span className="text-gray-400 italic">Click to add...</span>
                                  )}
                                </div>
                                {entry.implementationMethod && entry.implementationMethod.length > 200 && !isCellExpanded(entry.id, 'implementationMethod') && (
                                  <div className="absolute bottom-0 right-0 left-0 h-12 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                                )}
                                {entry.implementationMethod && entry.implementationMethod.length > 200 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCellExpansion(entry.id, 'implementationMethod');
                                    }}
                                    className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-600 bg-white/95 backdrop-blur-sm hover:bg-cyan-100 border border-cyan-200 hover:border-cyan-300 rounded-md transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 z-10 ${
                                      !isCellExpanded(entry.id, 'implementationMethod')
                                        ? 'absolute bottom-2 right-2'
                                        : 'mt-2'
                                    }`}
                                  >
                                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                                      {isCellExpanded(entry.id, 'implementationMethod') ? '▲' : '▼'}
                                    </span>
                                    {isCellExpanded(entry.id, 'implementationMethod') ? 'Read Less' : 'Read More'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Evidence Badge */}
                          {entry.evidenceSummary && (
                            entry.evidenceSummary.documents?.length > 0 ||
                            entry.evidenceSummary.interviews?.length > 0
                          ) && (
                            <button
                              onClick={() => handleShowEvidence(entry.control.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-cyan-100 text-cyan-800 rounded hover:bg-cyan-200 transition-colors whitespace-nowrap flex-shrink-0"
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
