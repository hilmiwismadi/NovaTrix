import { useState, useEffect } from 'react';
import { Upload, Search, Loader2, Trash2 } from 'lucide-react';
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
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

      {/* Documents Grid */}
      {!isLoading && filteredDocs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} hoverable onClick={() => handleDocumentClick(doc)}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">{doc.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.status}>{doc.status.toUpperCase()}</Badge>
                  <button
                    onClick={(e) => handleDeleteClick(e, doc)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
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
