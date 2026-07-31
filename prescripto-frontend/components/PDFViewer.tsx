"use client";

import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

type PDFViewerProps = {
  file: string;
  onLoadSuccess: (data: { numPages: number }) => void;
  numPages: number | null;
};

export function PDFViewer({ file, onLoadSuccess, numPages }: PDFViewerProps) {
  const [ready, setReady] = useState(false);
  const [PdfModule, setPdfModule] = useState<any>(null);

  useEffect(() => {
    let active = true;

    import("react-pdf").then((mod) => {
      if (!active) return;
      const { pdfjs } = mod;
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfModule(mod);
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  if (!ready || !PdfModule) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading document securely...
      </div>
    );
  }

  const { Document, Page } = PdfModule;

  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      className="max-w-full"
      loading={
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading document securely...
        </div>
      }
      error={
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-white p-8 rounded-xl border shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mb-4" />
          <p>Unable to load PDF.</p>
          <p className="text-xs mt-1">If this is a local blob URL or dummy file, it may not exist.</p>
        </div>
      }
    >
      {Array.from(new Array(numPages || 0), (_el, index) => (
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          className="mb-4 shadow-lg rounded-sm overflow-hidden border border-border"
          width={typeof window !== "undefined" ? Math.min(window.innerWidth * 0.8, 800) : 800}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      ))}
    </Document>
  );
}
