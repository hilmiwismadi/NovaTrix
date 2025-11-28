// Document Upload Form Component
// Modal form for uploading new PDF documents

import { useState } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import useDocumentStore from '../../stores/documentStore';

export default function DocumentUploadForm({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const { uploadDocument, uploadProgress, isLoading, error } = useDocumentStore();

  const handleFileSelect = (selectedFile) => {
    // Validate file type
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      // Auto-fill title from filename if empty
      if (!title) {
        const fileName = selectedFile.name.replace('.pdf', '');
        setTitle(fileName);
      }
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !title) {
      alert('Please provide both a title and a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const result = await uploadDocument(formData);

    if (result.success) {
      // Reset form
      setTitle('');
      setFile(null);
      // Call success callback
      if (onSuccess) onSuccess(result.data);
      // Close modal
      onClose();
    }
  };

  const handleCancel = () => {
    setTitle('');
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full shadow-glass border border-gray-200/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Upload Failed</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <Input
              type="text"
              placeholder="e.g., UGM Information Security Policy 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PDF File *
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isLoading && document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                disabled={isLoading}
              />

              {file ? (
                <div className="flex items-center justify-center gap-3 text-gray-700">
                  <FileText size={24} className="text-cyan-600" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto text-gray-400" size={48} />
                  <div>
                    <p className="text-gray-700 font-medium">
                      Drop PDF file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Maximum file size: 50 MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isLoading && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !file || !title}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
