import React, { useState } from 'react';
import { Download, ExternalLink, FileText, FileSpreadsheet, Check, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function ExportZone({
  presentationId,
  presentationUrl,
  onDownloadJson
}) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPptx, setDownloadingPptx] = useState(false);

  // Download PDF file
  const downloadPdfFile = async () => {
    setDownloadingPdf(true);
    try {
      const response = await api.get(`/quiz/download-pdf`, {
        params: { presentationId },
        responseType: 'blob' // critical to handle binary stream data
      });

      // Create a blob URL and click it to start the download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `quiz_presentation_${presentationId.substring(0, 6)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF export. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Download PPTX file
  const downloadPptxFile = async () => {
    setDownloadingPptx(true);
    try {
      const response = await api.get(`/quiz/download-ppt`, {
        params: { presentationId },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `quiz_presentation_${presentationId.substring(0, 6)}.pptx`;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading PPTX:', err);
      alert('Failed to download PPTX PowerPoint file. Please try again.');
    } finally {
      setDownloadingPptx(false);
    }
  };

  if (!presentationId) return null;

  return (
    <div className="glass-card rounded-2xl p-6 border-2 border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.01] flex flex-col gap-4 animate-fade-in glow-card-active">
      
      {/* Sparkle Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-darkbg-border">
        <div className="bg-emerald-500 text-white p-1.5 rounded-lg">
          <Check className="w-4.5 h-4.5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
            Presentation Ready! <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
            Duplicated slides populated with placeholders successfully
          </p>
        </div>
      </div>

      {/* Primary Slide Redirect */}
      <a
        href={presentationUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-sm shadow-emerald-600/10 hover:shadow-emerald-600/20"
      >
        <ExternalLink className="w-4.5 h-4.5" />
        <span>Open in Google Slides</span>
      </a>

      {/* Direct Google Downloads (Instant) */}
      <div className="flex flex-col gap-1.5 mt-1">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider px-0.5">
          Direct Google Downloads (Instant)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`https://docs.google.com/presentation/d/${presentationId}/export/pptx`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
            title="Download PowerPoint PPTX directly from Google"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Direct PPTX Link</span>
          </a>

          <a
            href={`https://docs.google.com/presentation/d/${presentationId}/export/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]"
            title="Download PDF directly from Google"
          >
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Direct PDF Link</span>
          </a>
        </div>
      </div>

      {/* Backup Exports (via backend api) */}
      <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-200 dark:border-darkbg-border/60 pt-3">
        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider px-0.5">
          Backup Backend Export
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* PowerPoint */}
          <button
            onClick={downloadPptxFile}
            disabled={downloadingPptx || downloadingPdf}
            className="btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            {downloadingPptx ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-orange-500" />
            )}
            <span>{downloadingPptx ? 'Exporting...' : 'PowerPoint (.pptx)'}</span>
          </button>

          {/* PDF */}
          <button
            onClick={downloadPdfFile}
            disabled={downloadingPdf || downloadingPptx}
            className="btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            {downloadingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-red-500" />
            )}
            <span>{downloadingPdf ? 'Generating...' : 'PDF Document'}</span>
          </button>

          {/* Raw JSON */}
          <button
            onClick={onDownloadJson}
            className="btn-secondary py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Questions (.json)</span>
          </button>

        </div>
      </div>
    </div>
  );
}
