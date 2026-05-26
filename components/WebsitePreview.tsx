'use client';

import { useRef, useState, useCallback } from 'react';

interface SiteError {
  message: string;
  source: string;
  lineno: number;
  colno: number;
}

interface WebsitePreviewProps {
  siteUrl: string | null;
  errors: SiteError[];
  onError: (error: SiteError) => void;
}

export default function WebsitePreview({ siteUrl, errors, onError }: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeWidth, setIframeWidth] = useState(375);
  const [isResizing, setIsResizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (event.source !== iframeRef.current?.contentWindow) return;
    if (event.data?.type === 'site-error') {
      onError({
        message: event.data.message || 'Unknown error',
        source: event.data.source || '',
        lineno: event.data.lineno || 0,
        colno: event.data.colno || 0,
      });
    }
  }, [onError]);

  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = iframeWidth;

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      const newWidth = Math.max(320, Math.min(1440, startWidth + delta));
      setIframeWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [iframeWidth]);

  if (!siteUrl) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Your Site will appear here after the first build.</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b text-xs text-gray-500">
        <span>{iframeWidth}px</span>
        <div className="flex gap-2">
          <button onClick={() => setIframeWidth(375)} className="px-2 py-0.5 rounded hover:bg-gray-200">Mobile</button>
          <button onClick={() => setIframeWidth(768)} className="px-2 py-0.5 rounded hover:bg-gray-200">Tablet</button>
          <button onClick={() => setIframeWidth(1200)} className="px-2 py-0.5 rounded hover:bg-gray-200">Desktop</button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-2 py-0.5 rounded hover:bg-gray-200">{isFullscreen ? 'Exit' : 'Full'}</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 flex justify-center p-4">
        <div className="shadow-lg transition-all duration-200 bg-white" style={{ width: iframeWidth, minHeight: '100%' }}>
          <iframe
            ref={iframeRef}
            src={siteUrl}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            title="Site Preview"
          />
        </div>
        <div
          className={`w-2 cursor-col-resize hover:bg-blue-500/20 ${isResizing ? 'bg-blue-500/30' : ''}`}
          onMouseDown={startResize}
          style={{ userSelect: 'none' }}
        />
      </div>
    </div>
  );
}
