import { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Input from '../components/common/Input';
import useControlsStore, { CATEGORIES } from '../stores/controlsStore';

export default function ControlNavigator() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const {
    controls,
    selectedControl,
    isLoading,
    isLoadingDetail,
    error,
    fetchControls,
    fetchControlById,
    clearSelectedControl
  } = useControlsStore();

  // Fetch controls on mount
  useEffect(() => {
    fetchControls();
  }, [fetchControls]);

  // Filter controls by category and search term
  const filteredControls = controls.filter(control => {
    const matchesCategory = selectedCategory === 'ALL' || control.category === selectedCategory;
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle control click - fetch full details
  const handleControlClick = async (control) => {
    await fetchControlById(control.id);
  };

  // Handle document click - open in new tab
  const handleDocumentClick = (e, doc) => {
    e.stopPropagation();
    window.open(`/documents/${doc.slug}`, '_blank');
  };

  // Handle interview click - open in new tab
  const handleInterviewClick = (e, respondent) => {
    e.stopPropagation();
    window.open('/interviews', '_blank');
  };

  const categories = ['ALL', ...Object.keys(CATEGORIES)];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Annex A Controls</h1>
        <p className="text-gray-500 mt-1.5 text-sm">ISO 27001:2022 Control Navigator</p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
              selectedCategory === cat
                ? 'bg-cyan-600 text-white border-cyan-600 shadow-soft'
                : 'bg-white text-gray-700 border-gray-300 hover:border-cyan-600 hover:text-cyan-600 hover:scale-105 active:scale-95 hover:shadow-soft'
            }`}
          >
            {cat === 'ALL' ? 'All Controls' : CATEGORIES[cat]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search controls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Loading State */}
      {isLoading && controls.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-600" size={48} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading controls</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Controls Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredControls.map(control => (
            <Card key={control.id} hoverable onClick={() => handleControlClick(control)}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{control.id}</h3>
                  <p className="text-sm font-medium text-gray-700">{control.title}</p>
                </div>
                <Badge variant={control.status}>{control.status.toUpperCase()}</Badge>
              </div>
              <ProgressBar value={control.rating} className="mb-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Docs: {control.relatedDocsCount || 0}</span>
                <span>Interviews: {control.relatedInterviewsCount || 0}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && !error && filteredControls.length === 0 && controls.length > 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No controls found</h3>
          <p className="text-gray-500">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Control Detail Modal */}
      {selectedControl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={clearSelectedControl}>
          <div className="bg-white/90 backdrop-blur-glass rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-glass border border-gray-300/50" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={clearSelectedControl}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                title="Close"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-cyan-600" size={48} />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedControl.id}</h2>
                    <p className="text-lg text-gray-800 mt-1">{selectedControl.title}</p>
                  </div>
                  <Badge variant={selectedControl.status} size="lg">{selectedControl.status.toUpperCase()}</Badge>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Description</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedControl.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Compliance Rating</h3>
                    <ProgressBar value={selectedControl.rating} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Related Evidence</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-2">Documents:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedControl.relatedDocs && selectedControl.relatedDocs.length > 0 ? (
                            selectedControl.relatedDocs.map(doc => (
                              <button
                                key={doc.id}
                                onClick={(e) => handleDocumentClick(e, doc)}
                                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                title={`View ${doc.title}`}
                              >
                                {doc.title}
                              </button>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 mb-2">Interviews:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedControl.relatedInterviews && selectedControl.relatedInterviews.length > 0 ? (
                            selectedControl.relatedInterviews.map(respondent => (
                              <button
                                key={respondent.id}
                                onClick={(e) => handleInterviewClick(e, respondent)}
                                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                                title={`View interview with ${respondent.name}`}
                              >
                                {respondent.name}
                              </button>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedControl.explanation && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Explanation</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedControl.explanation}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Suggested Actions</h3>
                    {selectedControl.suggestedActions && selectedControl.suggestedActions.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 leading-relaxed">
                        {selectedControl.suggestedActions.map((action) => (
                          <li key={action.id}>{action.actionText}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No suggested actions available</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/80">
                  <button
                    onClick={clearSelectedControl}
                    className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-md hover:bg-gray-50 hover:border-cyan-600/30 hover:scale-105 active:scale-95 transition-all duration-200 shadow-soft hover:shadow-soft-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
