import { useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Input from '../components/common/Input';
import { annexAControls, CATEGORIES, getControlsByCategory } from '../data/mockAnnexA';

export default function ControlNavigator() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedControl, setSelectedControl] = useState(null);

  const filteredControls = annexAControls.filter(control => {
    const matchesCategory = selectedCategory === 'ALL' || control.category === selectedCategory;
    const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         control.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            className={`px-4 py-2 rounded-lg font-medium transition-all border ${
              selectedCategory === cat
                ? 'bg-cyan text-white border-cyan'
                : 'bg-white text-gray-700 border-gray-300 hover:border-cyan hover:text-cyan'
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

      {/* Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredControls.map(control => (
          <Card key={control.id} hoverable onClick={() => setSelectedControl(control)}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{control.id}</h3>
                <p className="text-sm font-medium text-gray-700">{control.title}</p>
              </div>
              <Badge variant={control.status}>{control.status.toUpperCase()}</Badge>
            </div>
            <ProgressBar value={control.rating} className="mb-3" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Docs: {control.relatedDocs.length}</span>
              <span>Interviews: {control.relatedInterviews.length}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Detail Modal */}
      {selectedControl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedControl(null)}>
          <div className="bg-white/90 backdrop-blur-glass rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-glass border border-gray-300/50" onClick={(e) => e.stopPropagation()}>
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
                      {selectedControl.relatedDocs.map(doc => (
                        <Badge key={doc} variant="default" size="sm">{doc}</Badge>
                      ))}
                      {selectedControl.relatedDocs.length === 0 && (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">Interviews:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedControl.relatedInterviews.map(int => (
                        <Badge key={int} variant="default" size="sm">{int}</Badge>
                      ))}
                      {selectedControl.relatedInterviews.length === 0 && (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2.5 text-base">AI Explanation</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedControl.explanation}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2.5 text-base">Suggested Actions</h3>
                <ul className="list-disc list-inside text-gray-600 text-sm space-y-1.5 leading-relaxed">
                  {selectedControl.suggestedActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200/80">
              <button
                onClick={() => setSelectedControl(null)}
                className="w-full px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-md hover:bg-gray-50 hover:border-cyan/30 transition-all shadow-soft hover:shadow-soft-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
