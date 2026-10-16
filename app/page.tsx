'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  RefreshCw,
  AlertCircle,
  FileCode,
  FolderArchive,
} from 'lucide-react';
import { parseExcelFile } from '@/lib/excel-parser';
import { generateXmlFromWorkbook, sanitizeXmlName } from '@/lib/xml-generator';
import { generateMoodleQuizXml, isQuizSpreadsheet } from '@/lib/quiz-xml-generator';
import { WorkbookData, XmlExportOptions, ColumnMapping } from '@/types/converter';
import JSZip from 'jszip';

type ConversionFormat = 'quiz' | 'standard';

export default function Home() {
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [formatMode, setFormatMode] = useState<ConversionFormat>('quiz');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const parsed = await parseExcelFile(file);
      setWorkbook(parsed);

      // Auto-detect if spreadsheet is a quiz/exam
      const activeSheet = parsed.sheets[parsed.activeSheetName] || Object.values(parsed.sheets)[0];
      if (activeSheet && isQuizSpreadsheet(activeSheet.headers)) {
        setFormatMode('quiz');
      } else {
        setFormatMode('standard');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to read spreadsheet file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setWorkbook(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Standard tabular XML options
  const getStandardExportOptions = (wb: WorkbookData): XmlExportOptions => {
    const activeSheet = wb.sheets[wb.activeSheetName] || Object.values(wb.sheets)[0];
    const mappings: Record<string, ColumnMapping> = {};

    if (activeSheet) {
      activeSheet.headers.forEach((h, idx) => {
        mappings[h] = {
          originalHeader: h,
          targetTag: sanitizeXmlName(h, 'snake'),
          type: 'auto',
          isAttribute: false,
          isRowId: idx === 0 && (h.toLowerCase().includes('id') || h.includes('កូដ') || h.includes('អត្តលេខ')),
          include: true,
        };
      });
    }

    const defaultRoot = activeSheet?.name?.includes('ទំនិញ')
      ? 'បញ្ជីទំនិញ'
      : activeSheet?.name?.includes('បុគ្គលិក')
      ? 'បញ្ជីបុគ្គលិក'
      : `${(activeSheet?.name || 'dataset').toLowerCase()}_dataset`;

    const defaultRow = activeSheet?.name?.includes('ទំនិញ')
      ? 'ទំនិញ'
      : activeSheet?.name?.includes('បុគ្គលិក')
      ? 'បុគ្គលិក'
      : (activeSheet?.name || 'item').toLowerCase().endsWith('s')
      ? (activeSheet?.name || 'item').toLowerCase().slice(0, -1)
      : 'item';

    return {
      dialect: 'standard',
      rootTag: sanitizeXmlName(defaultRoot, 'snake'),
      rowTag: sanitizeXmlName(defaultRow, 'snake'),
      casing: 'snake',
      includeDeclaration: true,
      encoding: 'UTF-8',
      standalone: false,
      includeMetadata: false,
      indent: '2',
      nullHandling: 'omit',
      multiSheetMode: 'single_sheet',
      columnMappings: mappings,
      wrapStringsInCdata: false,
      escapeEntities: true,
      exportTimestamp: '2026-03-15T12:00:00Z',
    };
  };

  // Computed XML generation
  const generatedData = useMemo(() => {
    if (!workbook) {
      return { xml: '', count: 0 };
    }

    if (formatMode === 'quiz') {
      const { xml, questionCount } = generateMoodleQuizXml(workbook);
      return { xml, count: questionCount };
    } else {
      const options = getStandardExportOptions(workbook);
      const res = generateXmlFromWorkbook(workbook, options);
      const activeSheet = workbook.sheets[workbook.activeSheetName] || Object.values(workbook.sheets)[0];
      return { xml: res.xml, count: activeSheet?.totalRows ?? 0 };
    }
  }, [workbook, formatMode]);

  // Convert and download the active sheet XML
  const handleDownloadXml = () => {
    if (!workbook || !generatedData.xml) return;
    setIsDownloading(true);

    try {
      const safeBase = workbook.fileName.replace(/\.[^/.]+$/, '');
      const suffix = formatMode === 'quiz' ? '_moodle_quiz' : '_export';
      const filename = `${safeBase}${suffix}.xml`;

      // Prepend UTF-8 BOM (\uFEFF) to guarantee Excel & Windows Notepad open Khmer text without Mojibake
      const utf8Content = '\uFEFF' + generatedData.xml;
      const blob = new Blob([utf8Content], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not generate XML file.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Download all sheets as a zip
  const handleDownloadZip = async () => {
    if (!workbook) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('xml_exports');

      workbook.sheetNames.forEach((sheetName) => {
        const singleWb: WorkbookData = {
          ...workbook,
          activeSheetName: sheetName,
        };

        let xmlContent = '';
        if (formatMode === 'quiz') {
          xmlContent = generateMoodleQuizXml(singleWb).xml;
        } else {
          const options = getStandardExportOptions(singleWb);
          xmlContent = generateXmlFromWorkbook(singleWb, options).xml;
        }

        const safeSheetName = sheetName.replace(/[^a-zA-Z0-9_\u1780-\u17FF-]/g, '_');
        folder?.file(`${safeSheetName}.xml`, '\uFEFF' + xmlContent);
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
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not generate ZIP archive.');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const activeSheet = workbook ? workbook.sheets[workbook.activeSheetName] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl">
        {/* App Title */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm mb-3">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            XLSX to XML Converter
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Convert Excel spreadsheets to Moodle Quiz XML (&lt;quiz&gt;) or standard XML
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
          {!workbook ? (
            /* Upload Box */
            <div>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4">
                  <UploadCloud className="h-7 w-7" />
                </div>

                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Click to upload or drag and drop
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Excel (.xlsx, .xls) or CSV
                </div>
              </div>
            </div>
          ) : (
            /* File Loaded & Download Box */
            <div className="space-y-6">
              {/* File Info Banner */}
              <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                  <FileCode className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {workbook.fileName}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{formatFileSize(workbook.fileSize)}</span>
                    <span aria-hidden="true">·</span>
                    {formatMode === 'quiz' ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        {generatedData.count} Questions counted for Moodle
                      </span>
                    ) : (
                      <span>
                        {activeSheet?.totalRows ?? 0} rows, {activeSheet?.totalCols ?? 0} cols
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Format Switcher: Moodle Quiz XML vs Standard XML */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Target XML Format:
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setFormatMode('quiz')}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      formatMode === 'quiz'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Moodle Quiz XML (&lt;quiz&gt;)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormatMode('standard')}
                    className={`py-2 px-3 rounded-lg font-medium transition-all ${
                      formatMode === 'standard'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Standard XML (&lt;dataset&gt;)
                  </button>
                </div>
              </div>

              {/* Primary Download Action */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleDownloadXml}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    Download {formatMode === 'quiz' ? 'Moodle Quiz XML' : 'XML'} ({generatedData.count} {formatMode === 'quiz' ? 'Questions' : 'Rows'})
                  </span>
                </button>

                {/* Multiple sheets option */}
                {workbook.sheetNames.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <FolderArchive className="h-4 w-4" />
                    <span>Download All Sheets as ZIP ({workbook.sheetNames.length} sheets)</span>
                  </button>
                )}
              </div>

              {/* Upload Another File Button */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Upload a different file</span>
                </button>
              </div>
            </div>
          )}

          {/* Error notice if any */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
