'use client';

import React from 'react';
import { ColumnMapping, ColumnDataType, TagCasing } from '@/types/converter';
import { applyCasing } from '@/lib/xml-generator';
import { Settings2, Sliders, CheckSquare, Square, RotateCcw, Sparkles } from 'lucide-react';

interface ColumnMappingStudioProps {
  headers: string[];
  mappings: Record<string, ColumnMapping>;
  onChangeMapping: (header: string, updated: Partial<ColumnMapping>) => void;
  onBatchUpdateCasing: (casing: TagCasing) => void;
  onToggleAll: (include: boolean) => void;
  onResetMappings: () => void;
}

export function ColumnMappingStudio({
  headers,
  mappings,
  onChangeMapping,
  onBatchUpdateCasing,
  onToggleAll,
  onResetMappings,
}: ColumnMappingStudioProps) {
  const activeCount = headers.filter((h) => mappings[h]?.include !== false).length;

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Column & Tag Mapping Studio
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Customize XML tag names, target data types, and attribute placements for each column.
          </p>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
            <span className="px-1.5 text-slate-500">Casing:</span>
            <button
              onClick={() => onBatchUpdateCasing('snake')}
              className="px-2 py-0.5 rounded font-mono hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Convert all tags to snake_case"
            >
              snake
            </button>
            <button
              onClick={() => onBatchUpdateCasing('camel')}
              className="px-2 py-0.5 rounded font-mono hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Convert all tags to camelCase"
            >
              camel
            </button>
            <button
              onClick={() => onBatchUpdateCasing('kebab')}
              className="px-2 py-0.5 rounded font-mono hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Convert all tags to kebab-case"
            >
              kebab
            </button>
            <button
              onClick={() => onBatchUpdateCasing('pascal')}
              className="px-2 py-0.5 rounded font-mono hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Convert all tags to PascalCase"
            >
              Pascal
            </button>
          </div>

          <button
            onClick={() => onToggleAll(activeCount < headers.length)}
            className="px-2 py-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {activeCount === headers.length ? 'Exclude All' : 'Include All'}
          </button>

          <button
            onClick={onResetMappings}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset mappings to default"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Mapping Rows Table */}
      <div className="flex-1 overflow-auto max-h-[460px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100/90 dark:border-slate-800 dark:bg-slate-800/90 backdrop-blur-xs">
              <th className="w-10 px-3 py-2 text-center">Inc</th>
              <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                Excel Column
              </th>
              <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                XML Element Tag
              </th>
              <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                Data Type
              </th>
              <th className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 text-center">
                Mode
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {headers.map((header) => {
              const mapping = mappings[header] || {
                originalHeader: header,
                targetTag: header,
                type: 'auto',
                isAttribute: false,
                isRowId: false,
                include: true,
              };

              const isIncluded = mapping.include !== false;

              return (
                <tr
                  key={header}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                    !isIncluded ? 'opacity-40 bg-slate-50/40 dark:bg-slate-900/40' : ''
                  }`}
                >
                  {/* Include Toggle */}
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={isIncluded}
                      onChange={(e) =>
                        onChangeMapping(header, { include: e.target.checked })
                      }
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </td>

                  {/* Original Column Header */}
                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                    {header}
                  </td>

                  {/* Target Tag Name Input */}
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      disabled={!isIncluded}
                      value={mapping.targetTag}
                      onChange={(e) =>
                        onChangeMapping(header, { targetTag: e.target.value })
                      }
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                    />
                  </td>

                  {/* Target Data Type */}
                  <td className="px-3 py-1.5">
                    <select
                      disabled={!isIncluded}
                      value={mapping.type}
                      onChange={(e) =>
                        onChangeMapping(header, {
                          type: e.target.value as ColumnDataType,
                        })
                      }
                      className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="string">String (escaped)</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date (ISO)</option>
                      <option value="cdata">CDATA Block</option>
                    </select>
                  </td>

                  {/* Placement Mode: Element / Attribute / Row ID */}
                  <td className="px-3 py-1.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        disabled={!isIncluded}
                        onClick={() =>
                          onChangeMapping(header, {
                            isAttribute: false,
                            isRowId: false,
                          })
                        }
                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                          !mapping.isAttribute && !mapping.isRowId
                            ? 'bg-slate-900 text-white dark:bg-emerald-600'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                        title="Render as child tag: <tag>value</tag>"
                      >
                        Tag
                      </button>
                      <button
                        type="button"
                        disabled={!isIncluded}
                        onClick={() =>
                          onChangeMapping(header, {
                            isAttribute: true,
                            isRowId: false,
                          })
                        }
                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                          mapping.isAttribute
                            ? 'bg-slate-900 text-white dark:bg-emerald-600'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                        title="Render as attribute: <record tag='value' />"
                      >
                        Attr
                      </button>
                      <button
                        type="button"
                        disabled={!isIncluded}
                        onClick={() =>
                          onChangeMapping(header, {
                            isAttribute: false,
                            isRowId: !mapping.isRowId,
                          })
                        }
                        className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                          mapping.isRowId
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                        }`}
                        title="Use as Row Identifier attribute: <record id='value'>"
                      >
                        ID
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer helper */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{activeCount}</strong> of{' '}
          <strong className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{headers.length}</strong> columns will be included in the XML output.
        </span>
        <span className="text-slate-400">
          Click &ldquo;ID&rdquo; to attach a column as the primary key of each record tag.
        </span>
      </div>
    </div>
  );
}
