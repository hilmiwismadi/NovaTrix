import { useState, useEffect } from 'react';
import { Upload, Search, Loader2, Trash2, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import DocumentUploadForm from '../components/documents/DocumentUploadForm';
import useDocumentStore from '../stores/documentStore';

export default function DocumentDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'

  const { documents, isLoading, fetchDocuments, deleteDocument } = useDocumentStore();

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents by search term
  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.summaryShort?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle document click - navigate to detail view
  const handleDocumentClick = (doc) => {
    navigate(`/documents/${doc.slug}`);
  };

  // Handle upload success
  const handleUploadSuccess = (newDocument) => {
    // Optionally show success message or navigate to the new document
    console.log('Document uploaded successfully:', newDocument);
  };

  // Handle delete button click
  const handleDeleteClick = (e, doc) => {
    e.stopPropagation(); // Prevent card click navigation
    setDocumentToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (documentToDelete) {
      const result = await deleteDocument(documentToDelete.slug);
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDocumentToDelete(null);
      }
    }
  };

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDocumentToDelete(null);
  };

  // Generate Document Management Log ID
  const getDocumentLogId = (index) => {
    return `DML-${String(index + 1).padStart(3, '0')}`;
  };

  // Get access level for document
  const getAccessLevel = (doc) => {
    // Map document status to access level
    if (doc.title?.toLowerCase().includes('public') || doc.status === 'raw') return 'Public';
    if (doc.title?.toLowerCase().includes('confidential') || doc.status === 'verified') return 'Confidential';
    if (doc.title?.toLowerCase().includes('restricted')) return 'Restricted';
    return 'Internal';
  };

  // Get version from document or default
  const getVersion = (doc) => {
    return doc.version || 'v1.0';
  };

  // Get last review date
  const getLastReviewDate = (doc) => {
    return doc.lastReviewDate || doc.uploadDate;
  };

  // Get owner/author
  const getOwner = (doc) => {
    return doc.uploadedBy?.fullName || doc.owner || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Documents</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Document Analysis Hub ({documents.length} document{documents.length !== 1 ? 's' : ''})
          </p>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={() => setIsUploadModalOpen(true)}
        >
          <Upload size={16} />
          Upload Document
        </Button>
      </div>

      {/* View Toggle Tabs and Search */}
      <div className="flex items-center justify-between gap-4">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
              viewMode === 'card'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <LayoutGrid size={18} />
            Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
              viewMode === 'table'
                ? 'bg-white text-cyan-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TableIcon size={18} />
            Table View
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && documents.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-cyan-600" size={48} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && documents.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-6">Get started by uploading your first document</p>
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2"
          >
            <Upload size={16} />
            Upload Document
          </Button>
        </div>
      )}

      {/* Card View */}
      {!isLoading && filteredDocs.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hoverable onClick={() => handleDocumentClick(doc)}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{doc.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status}>{doc.status.toUpperCase()}</Badge>
                  <button
                    onClick={(e) => handleDeleteClick(e, doc)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 transition-all duration-200"
                    title="Delete document"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Type:</span> {doc.fileType} • {doc.fileSize}</p>
                <p><span className="font-medium">Uploaded:</span> {new Date(doc.uploadDate).toLocaleDateString()}</p>
                <p><span className="font-medium">Uploaded by:</span> {doc.uploadedBy?.fullName || 'Unknown'}</p>
                {doc.summaryShort && (
                  <p className="line-clamp-2"><span className="font-medium">Summary:</span> {doc.summaryShort}</p>
                )}
                {doc._count?.annotations > 0 && (
                  <p><span className="font-medium">Annotations:</span> {doc._count.annotations}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Table View - Document Management Log */}
      {!isLoading && filteredDocs.length > 0 && viewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: '8%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Title</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Version</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date Created</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Date Last Review</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Owner / Author</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Access Level</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, index) => (
                  <tr
                    key={doc.id}
                    onClick={() => handleDocumentClick(doc)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm font-medium text-gray-900">
                        {getDocumentLogId(index)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium text-gray-900 line-clamp-2">
                          {doc.title}
                        </span>
                        <button
                          onClick={(e) => handleDeleteClick(e, doc)}
                          className="p-1 rounded-md text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                          title="Delete document"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm text-gray-700">
                        {getVersion(doc)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm text-gray-700">
                        {new Date(doc.uploadDate).toISOString().split('T')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm text-gray-700">
                        {new Date(getLastReviewDate(doc)).toISOString().split('T')[0]}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm text-gray-700">
                        {getOwner(doc)}
                      </span>
                    </td>
                    <td className="py-4 px-4 align-top">
                      <Badge
                        variant={
                          getAccessLevel(doc) === 'Public' ? 'default' :
                          getAccessLevel(doc) === 'Internal' ? 'analyzed' :
                          getAccessLevel(doc) === 'Confidential' ? 'partial' :
                          'high'
                        }
                        size="sm"
                      >
                        {getAccessLevel(doc)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* No Results */}
      {!isLoading && documents.length > 0 && filteredDocs.length === 0 && (
        <div className="text-center py-12">
          <Search className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-500">Try adjusting your search term</p>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadForm
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={handleDeleteCancel}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full pointer-events-auto">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this document?
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  <span className="font-medium">Document:</span> {documentToDelete?.title}
                </p>
                <p className="text-sm text-red-600 mt-3">
                  This action cannot be undone. All annotations and associated data will be permanently deleted.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
                <Button
                  variant="secondary"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
