'use client';

import React from 'react';
import { FileSpreadsheet, Download, RefreshCw, Code2, HelpCircle } from 'lucide-react';

import Link from 'next/link';

interface NavbarProps {
  onLoadSample: () => void;
  onReset: () => void;
  onOpenDocs: () => void;
  hasFile: boolean;
  onDownloadXml: () => void;
  isXmlReady: boolean;
}

export function Navbar({
  onLoadSample,
  onReset,
  onOpenDocs,
  hasFile,
  onDownloadXml,
  isXmlReady,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-400 whitespace-nowrap shrink-0"
          >
            XLSX to XML
          </Link>
        </div>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#converter"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Converter
          </a>
          <a
            href="#dialects"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Supported Dialects
          </a>
          <button
            onClick={onOpenDocs}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            API & CLI Guide
          </button>
          <button
            onClick={onLoadSample}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left"
          >
            Try Sample File
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          {hasFile && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              title="Clear current file and start fresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={isXmlReady ? onDownloadXml : onLoadSample}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
          >
            {isXmlReady ? (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Download XML</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Load Sample</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
