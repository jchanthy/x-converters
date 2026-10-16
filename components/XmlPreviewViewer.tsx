'use client';

import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Code,
  FolderArchive,
  ExternalLink,
  Eye,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ConversionResult, WorkbookData, XmlExportOptions } from '@/types/converter';
import JSZip from 'jszip';
import { generateXmlFromWorkbook } from '@/lib/xml-generator';

interface XmlPreviewViewerProps {
  conversionResult: ConversionResult;
  workbook: WorkbookData;
  options: XmlExportOptions;
  onDownloadXml: () => void;
}

export function XmlPreviewViewer({
  conversionResult,
  workbook,
  options,
  onDownloadXml,
}: XmlPreviewViewerProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'simple'>('code');
  const [wrapText, setWrapText] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(conversionResult.xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Batch Zip Export of all worksheets
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('xml_exports');

      workbook.sheetNames.forEach((sheetName) => {
        // Generate separate XML for each sheet
        const singleSheetOptions: XmlExportOptions = {
          ...options,
          multiSheetMode: 'single_sheet',
        };
        const singleWb: WorkbookData = {
          ...workbook,
          activeSheetName: sheetName,
        };
        const res = generateXmlFromWorkbook(singleWb, singleSheetOptions);
        const safeSheetName = sheetName.replace(/[^a-zA-Z0-9_-]/g, '_');
        folder?.file(`${safeSheetName}.xml`, '\uFEFF' + res.xml);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workbook.fileName.replace(/\.[^/.]+$/, '')}_all_sheets_xml.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip', err);
      alert('Could not create ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const lines = useMemo(() => {
    return conversionResult.xml.split('\n');
  }, [conversionResult.xml]);

  const filteredLineIndices = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const indices = new Set<number>();
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(q)) {
        indices.add(idx);
      }
    });
    return indices;
  }, [lines, searchQuery]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Helper to colorize XML line tokens without external heavy deps
  const renderXmlLine = (line: string) => {
    if (!line) return <span>&nbsp;</span>;

    // Comments
    if (line.trim().startsWith('<!--')) {
      return <span className="text-slate-400 dark:text-slate-500 italic">{line}</span>;
    }
    // XML Declaration
    if (line.trim().startsWith('<?xml')) {
      return <span className="text-amber-600 dark:text-amber-400 font-medium">{line}</span>;
    }
    // CDATA
    if (line.includes('<![CDATA[')) {
      return <span className="text-purple-600 dark:text-purple-400">{line}</span>;
    }

    // Fast regex token replacement for tags, attributes, strings with full Unicode & Khmer support
    const parts = line.split(
      /(<\/?[\p{L}\p{M}\p{N}_:.-]+|[\p{L}\p{M}\p{N}_:.-]+(?==)|"[^"]*"|\/?>)/gu
    );

    return (
      <>
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (part.startsWith('<') || part.startsWith('</')) {
            return (
              <span key={pIdx} className="text-blue-600 dark:text-blue-400 font-medium">
                {part}
              </span>
            );
          }
          if (part === '>' || part === '/>') {
            return (
              <span key={pIdx} className="text-blue-600 dark:text-blue-400 font-medium">
                {part}
              </span>
            );
          }
          if (part.startsWith('"') && part.endsWith('"')) {
            return (
              <span key={pIdx} className="text-emerald-700 dark:text-emerald-300">
                {part}
              </span>
            );
          }
          if (/^[\p{L}\p{M}\p{N}_:.-]+$/u.test(part) && pIdx < parts.length - 1 && parts[pIdx + 1] === '=') {
            return (
              <span key={pIdx} className="text-violet-600 dark:text-violet-400">
                {part}
              </span>
            );
          }
          return (
            <span key={pIdx} className="text-slate-800 dark:text-slate-200">
              {part}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <div
      className={`flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs transition-all ${
        isFullscreen
          ? 'fixed inset-4 z-50 shadow-2xl overflow-hidden'
          : 'h-full overflow-hidden'
      }`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            XML Output Live Preview
          </h4>

          {/* Validation Status Indicator */}
          <div className="flex items-center gap-1.5 ml-2">
            {conversionResult.isValid ? (
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Well-Formed XML 1.0</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>XML Error</span>
              </span>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search XML */}
          <div className="relative min-w-[140px] sm:w-44">
            <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-slate-400" />
            <input
              type="text"
              placeholder="Find in XML..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          {/* Wrap Toggle */}
          <button
            onClick={() => setWrapText(!wrapText)}
            className={`px-2 py-1 text-[11px] rounded border transition-colors ${
              wrapText
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Toggle word wrap"
          >
            Wrap
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            title="Copy entire XML to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Download XML Button */}
          <button
            onClick={onDownloadXml}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            title="Download formatted XML file"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .xml</span>
          </button>

          {/* Download All Sheets ZIP Button (if multiple sheets) */}
          {workbook.sheetNames.length > 1 && (
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50"
              title="Download separate XML files for each sheet as a .zip"
            >
              <FolderArchive className="h-3.5 w-3.5" />
              <span>{isZipping ? 'Zipping...' : 'All Sheets (.zip)'}</span>
            </button>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Code Inspector'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Validation Warning Alert (if any) */}
      {!conversionResult.isValid && conversionResult.validationError && (
        <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-mono text-[11px]">
            {conversionResult.validationError}
          </div>
        </div>
      )}

      {/* Code Viewer Viewport with Line Numbers */}
      <div
        className={`flex-1 overflow-auto bg-slate-900 text-slate-100 font-mono text-[11.5px] leading-5 select-text p-2 ${
          isFullscreen ? 'max-h-[calc(100vh-140px)]' : 'max-h-[460px]'
        }`}
      >
        <div className="table w-full border-collapse">
          {lines.map((line, idx) => {
            const isMatch = filteredLineIndices ? filteredLineIndices.has(idx) : false;
            const isDimmed = filteredLineIndices && !isMatch;

            return (
              <div
                key={idx}
                className={`table-row hover:bg-slate-800/60 ${
                  isMatch ? 'bg-amber-950/40 ring-1 ring-amber-500/50' : ''
                } ${isDimmed ? 'opacity-30' : ''}`}
              >
                {/* Line number */}
                <div className="table-cell text-right pr-4 pl-2 select-none text-slate-600 font-mono text-[10px] w-12 align-top tabular-nums border-r border-slate-800/80">
                  {idx + 1}
                </div>

                {/* Code content */}
                <div
                  className={`table-cell pl-4 pr-3 align-top ${
                    wrapText ? 'whitespace-pre-wrap break-all' : 'whitespace-pre'
                  }`}
                >
                  {renderXmlLine(line)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status / Telemetry Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Lines:{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {conversionResult.lineCount}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Output Size:{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              {formatFileSize(conversionResult.sizeBytes)}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Encoding:{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
              {options.encoding}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Dialect:{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300">
              {options.dialect}
            </strong>
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Generated client-side with 0 external network requests
        </div>
      </div>
    </div>
  );
}
