// PDF Annotation Viewer Component
// PDF viewer with highlighting and annotation capabilities using @react-pdf-viewer

import { useState, useCallback, useEffect, useRef } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { highlightPlugin } from '@react-pdf-viewer/highlight';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { ZoomIn, ZoomOut, Maximize2, Copy, FileEdit } from 'lucide-react';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

// Color options for highlights with compliance status meanings
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FFFF00', status: 'Needs Review / To Be Verified' },
  { name: 'Green', value: '#90EE90', status: 'Compliant / Implemented' },
  { name: 'Blue', value: '#ADD8E6', status: 'Reference / Informational' },
  { name: 'Pink', value: '#FFB6C1', status: 'Gap / Non-Compliant' },
  { name: 'Orange', value: '#FFD580', status: 'Partially Compliant / In Progress' }
];

export default function PDFAnnotationViewer({
  pdfUrl,
  annotations = [],
  selectedAnnotation,
  onAnnotationCreate,
  onAnnotationSelect
}) {
  const [highlightColor, setHighlightColor] = useState(HIGHLIGHT_COLORS[0].value);
  const highlightColorRef = useRef(highlightColor); // Keep ref in sync with state
  const [message, setMessage] = useState('');
  const [selectionPopup, setSelectionPopup] = useState(null); // { text, position, annotationData, x, y }
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  // Update ref whenever color changes
  useEffect(() => {
    highlightColorRef.current = highlightColor;
  }, [highlightColor]);

  // Debug: Log once
  useEffect(() => {
    console.log('📄 PDF loaded with', annotations.length, 'annotations');
  }, [annotations.length]);

  // Scroll to selected annotation
  useEffect(() => {
    if (selectedAnnotation) {
      try {
        const position = typeof selectedAnnotation.position === 'string'
          ? JSON.parse(selectedAnnotation.position)
          : selectedAnnotation.position;

        // Jump to the page containing the annotation
        if (position.pageNumber) {
          jumpToPage(position.pageNumber - 1); // Convert to 0-based index
        }
      } catch (error) {
        console.error('Error scrolling to annotation:', error);
      }
    }
  }, [selectedAnnotation, jumpToPage]);

  // Early return if no URL
  if (!pdfUrl) {
    console.error('PDFAnnotationViewer - No PDF URL provided');
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error: No PDF URL provided</p>
          <p className="text-sm text-gray-500 mt-2">URL: {String(pdfUrl)}</p>
        </div>
      </div>
    );
  }

  // Transform annotations to the format expected by the highlight plugin
  const highlights = annotations.map(annotation => {
    try {
      const position = typeof annotation.position === 'string'
        ? JSON.parse(annotation.position)
        : annotation.position;

      // Check if position is valid
      if (!position) {
        console.warn('⚠️ Annotation has no position data:', annotation);
        return null;
      }

      if (!position.rects || !Array.isArray(position.rects)) {
        console.warn('⚠️ Position has no rects array:', position);
        return null;
      }

      const highlightAreas = position.rects.map(rect => ({
        pageIndex: rect.pageNumber - 1, // Use rect's pageNumber, not position's
        left: rect.x1,
        top: rect.y1,
        width: rect.x2 - rect.x1,
        height: rect.y2 - rect.y1,
      }));

      return {
        id: String(annotation.id),
        content: annotation.content,
        highlightAreas,
        color: annotation.color || '#FFFF00'
      };
    } catch (error) {
      console.error('❌ Error parsing annotation:', error, annotation);
      return null;
    }
  }).filter(Boolean);

  // Render a highlight
  const renderHighlights = (props) => {
    const highlightsOnPage = highlights.filter((highlight) =>
      highlight.highlightAreas.some((area) => area.pageIndex === props.pageIndex)
    );

    return (
      <div>
        {highlightsOnPage.map((highlight) => {
          const isSelected = selectedAnnotation && String(selectedAnnotation.id) === String(highlight.id);

          return (
            <div key={highlight.id}>
              {highlight.highlightAreas
                .filter((area) => area.pageIndex === props.pageIndex)
                .map((area, idx) => (
                  <div
                    key={idx}
                    className="highlight-area cursor-pointer transition-all hover:opacity-60"
                    style={{
                      position: 'absolute',
                      left: `${area.left}%`,
                      top: `${area.top}%`,
                      width: `${area.width}%`,
                      height: `${area.height}%`,
                      backgroundColor: highlight.color,
                      opacity: 0.4,
                      mixBlendMode: 'multiply',
                      border: isSelected ? '2px solid #0891b2' : 'none',
                      boxShadow: isSelected ? '0 0 0 2px rgba(8, 145, 178, 0.3)' : 'none',
                      pointerEvents: 'auto',
                      zIndex: isSelected ? 10 : 1,
                    }}
                    onClick={() => {
                      const annotationId = parseInt(highlight.id);
                      const annotation = annotations.find(a => a.id === annotationId);
                      if (annotation && onAnnotationSelect) {
                        onAnnotationSelect(annotation);
                      }
                    }}
                  />
                ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Configure highlight plugin
  const highlightPluginInstance = highlightPlugin({
    renderHighlights,
  });

  // Configure zoom plugin
  const zoomPluginInstance = zoomPlugin();
  const { ZoomIn: ZoomInButton, ZoomOut: ZoomOutButton, Zoom } = zoomPluginInstance;

  // Handle text selection
  const handleDocumentLoad = useCallback((e) => {
    // Wait for document to load, then add selection listener
    const viewerContainer = document.querySelector('.rpv-core__viewer');
    if (!viewerContainer) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText || selectedText.length === 0) return;

      // Get the range and its position
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Find which page the selection is on
      const textLayer = range.startContainer.parentElement?.closest('.rpv-core__text-layer');
      if (!textLayer) {
        console.warn('⚠️ Text layer not found');
        return;
      }

      const pageElement = textLayer.closest('.rpv-core__page-layer');
      if (!pageElement) {
        console.warn('⚠️ Page element not found');
        return;
      }

      // @react-pdf-viewer uses data-testid="core__page-layer-{pageIndex}"
      const testId = pageElement.getAttribute('data-testid');

      // Extract page index from data-testid (format: "core__page-layer-0", "core__page-layer-1", etc.)
      const pageIndexMatch = testId?.match(/core__page-layer-(\d+)/);
      const pageIndex = pageIndexMatch ? parseInt(pageIndexMatch[1]) : 0;

      // Get page dimensions for relative positioning
      const pageRect = pageElement.getBoundingClientRect();

      // Calculate relative position as percentage
      const relativeLeft = ((rect.left - pageRect.left) / pageRect.width) * 100;
      const relativeTop = ((rect.top - pageRect.top) / pageRect.height) * 100;
      const relativeWidth = (rect.width / pageRect.width) * 100;
      const relativeHeight = (rect.height / pageRect.height) * 100;

      // Create annotation data
      const position = {
        boundingRect: {
          x1: relativeLeft,
          y1: relativeTop,
          x2: relativeLeft + relativeWidth,
          y2: relativeTop + relativeHeight,
          width: relativeWidth,
          height: relativeHeight,
          pageNumber: pageIndex + 1
        },
        rects: [{
          x1: relativeLeft,
          y1: relativeTop,
          x2: relativeLeft + relativeWidth,
          y2: relativeTop + relativeHeight,
          width: relativeWidth,
          height: relativeHeight,
          pageNumber: pageIndex + 1
        }],
        pageNumber: pageIndex + 1
      };

      const newAnnotation = {
        content: selectedText,
        position: JSON.stringify(position),
        color: highlightColorRef.current,
        pageNumber: pageIndex + 1
      };

      // Show popup with options instead of immediately creating annotation
      setSelectionPopup({
        text: selectedText,
        annotationData: newAnnotation,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    };

    viewerContainer.addEventListener('mouseup', handleMouseUp);

    return () => {
      viewerContainer.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onAnnotationCreate]); // highlightColor removed - using ref instead

  // Handle copy text
  const handleCopyText = () => {
    if (selectionPopup?.text) {
      navigator.clipboard.writeText(selectionPopup.text);
      setMessage('Text copied!');
      setTimeout(() => setMessage(''), 2000);
    }
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Handle create annotation
  const handleCreateAnnotation = () => {
    if (selectionPopup?.annotationData) {
      onAnnotationCreate(selectionPopup.annotationData);
      setMessage('Annotation created!');
      setTimeout(() => setMessage(''), 2000);
    }
    setSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (selectionPopup) {
        setSelectionPopup(null);
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectionPopup]);

  return (
    <div className="h-full relative">
      {/* Text Selection Popup */}
      {selectionPopup && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300 flex gap-1 p-1"
          style={{
            left: `${selectionPopup.x}px`,
            top: `${selectionPopup.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopyText}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Copy text"
          >
            <Copy size={16} />
            Copy
          </button>
          <button
            onClick={handleCreateAnnotation}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
            title="Create annotation"
          >
            <FileEdit size={16} />
            Annotate
          </button>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <div className="flex flex-col gap-1">
          <ZoomInButton>
            {(props) => (
              <button
                onClick={props.onClick}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </ZoomInButton>
          <ZoomOutButton>
            {(props) => (
              <button
                onClick={props.onClick}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </ZoomOutButton>
          <Zoom>
            {(props) => (
              <button
                onClick={() => props.onZoom(SpecialZoomLevel.PageFit)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Fit to Page"
              >
                <Maximize2 className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </Zoom>
        </div>
      </div>

      {/* Color Picker */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-2">Compliance Status</p>
        <div className="flex gap-2">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => setHighlightColor(color.value)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                highlightColor === color.value
                  ? 'border-gray-900 scale-110'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color.value }}
              title={`${color.name}: ${color.status}`}
            />
          ))}
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {message}
        </div>
      )}

      {/* PDF Viewer */}
      <div className="h-full overflow-auto">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            plugins={[highlightPluginInstance, zoomPluginInstance, pageNavigationPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
            defaultScale={SpecialZoomLevel.PageWidth}
          />
        </Worker>
      </div>
    </div>
  );
}
