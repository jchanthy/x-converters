'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Layers, Table as TableIcon } from 'lucide-react';
import { WorkbookData, ExcelSheetData } from '@/types/converter';

interface ExcelDataGridProps {
  workbook: WorkbookData;
  activeSheetName: string;
  onSelectSheet: (sheetName: string) => void;
}

export function ExcelDataGrid({
  workbook,
  activeSheetName,
  onSelectSheet,
}: ExcelDataGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sheet: ExcelSheetData | undefined = workbook.sheets[activeSheetName];

  // Filter rows based on search
  const filteredRows = useMemo(() => {
    if (!sheet) return [];
    if (!searchQuery.trim()) return sheet.rows;

    const q = searchQuery.toLowerCase().trim();
    return sheet.rows.filter((row) =>
      sheet.headers.some((header) => {
        const val = row[header];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [sheet, searchQuery]);

  // Pagination calculation
  const totalRows = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  if (!sheet) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        No worksheet data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Top Bar: Sheet Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {/* Sheet Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 hidden lg:inline">
            Sheets:
          </span>
          {workbook.sheetNames.map((name) => {
            const isActive = name === activeSheetName;
            return (
              <button
                key={name}
                onClick={() => {
                  onSelectSheet(name);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <TableIcon className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>{name}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  ({workbook.sheets[name]?.totalRows ?? 0})
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Filter ${sheet.totalRows} rows...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Spreadsheet Table Viewport */}
      <div className="flex-1 overflow-auto max-h-[460px]">
        {sheet.rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-xs">
            <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300" />
            <span>Worksheet is empty (0 rows found).</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100/90 dark:border-slate-800 dark:bg-slate-800/90 backdrop-blur-xs">
                <th className="w-12 px-3 py-2 font-mono text-[11px] text-slate-400 dark:text-slate-500 text-center border-r border-slate-200 dark:border-slate-700/50">
                  #
                </th>
                {sheet.headers.map((header) => (
                  <th
                    key={header}
                    className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap border-r border-slate-200/60 dark:border-slate-700/50 last:border-r-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={sheet.headers.length + 1}
                    className="p-8 text-center text-slate-400 text-xs"
                  >
                    No matching rows found for &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const absoluteRowIndex = (safeCurrentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-3 py-2 font-mono text-[11px] text-slate-400 dark:text-slate-500 text-center border-r border-slate-100 dark:border-slate-800/60 select-none">
                        {absoluteRowIndex}
                      </td>
                      {sheet.headers.map((header) => {
                        const cellVal = row[header];
                        const isNull = cellVal === null || cellVal === undefined || cellVal === '';
                        const isNum = typeof cellVal === 'number';
                        const isBool = typeof cellVal === 'boolean';

                        return (
                          <td
                            key={header}
                            className={`px-3.5 py-2 text-slate-800 dark:text-slate-200 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 max-w-[220px] truncate ${
                              isNum ? 'font-mono tabular-nums' : ''
                            }`}
                          >
                            {isNull ? (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                                empty
                              </span>
                            ) : isBool ? (
                              <span
                                className={`text-[11px] font-mono ${
                                  cellVal ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                              >
                                {cellVal ? 'true' : 'false'}
                              </span>
                            ) : (
                              String(cellVal)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination & Status Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{paginatedRows.length}</strong> of{' '}
            <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{totalRows}</strong> rows
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{sheet.headers.length}</strong> columns
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-xs font-mono tabular-nums">
              {safeCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="p-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
