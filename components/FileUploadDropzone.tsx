'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Sparkles, CheckCircle2, AlertCircle, FileCode } from 'lucide-react';
import { SAMPLE_DATASETS } from '@/lib/sample-data';
import { WorkbookData } from '@/types/converter';

interface FileUploadDropzoneProps {
  onFileLoaded: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  workbook: WorkbookData | null;
  isLoading: boolean;
  error?: string | null;
}

export function FileUploadDropzone({
  onFileLoaded,
  onSelectSample,
  workbook,
  isLoading,
  error,
}: FileUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcessFile(files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const validExtensions = ['.xlsx', '.xls', '.xlsm', '.csv', '.tsv', '.ods'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      alert('Please upload a valid spreadsheet file (.xlsx, .xls, .xlsm, .csv, .ods).');
      return;
    }

    onFileLoaded(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full">
      {workbook ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                  {workbook.fileName}
                </span>
                <span className="text-xs text-slate-500">
                  {formatFileSize(workbook.fileSize)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{workbook.sheetNames.length} {workbook.sheetNames.length === 1 ? 'Worksheet' : 'Worksheets'}</span>
                <span aria-hidden="true">·</span>
                <span>Active: <strong className="font-medium text-slate-700 dark:text-slate-300">{workbook.activeSheetName}</strong></span>
                <span aria-hidden="true">·</span>
                <span>
                  {workbook.sheets[workbook.activeSheetName]?.totalRows ?? 0} rows,{' '}
                  {workbook.sheets[workbook.activeSheetName]?.totalCols ?? 0} columns
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              Replace File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-500'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.xlsm,.csv,.tsv,.ods"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform duration-200">
              <UploadCloud className="h-7 w-7" />
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Drop your Excel (.xlsx, .xls, .csv) file here
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
              Click to browse from your computer. Files are processed securely in your browser and never leave your machine.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <span>Supports .xlsx</span>
              <span aria-hidden="true">·</span>
              <span>.xls</span>
              <span aria-hidden="true">·</span>
              <span>.xlsm</span>
              <span aria-hidden="true">·</span>
              <span>.csv</span>
              <span aria-hidden="true">·</span>
              <span>Multi-sheet Workbooks</span>
            </div>
          </div>

          {/* Quick sample datasets */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Or test immediately with a ready-made sample workbook:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SAMPLE_DATASETS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.id)}
                  className="flex flex-col text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-xs"
                >
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {sample.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 line-clamp-2">
                    {sample.description}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium mt-2">
                    Load Sample &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
