'use client';

import React from 'react';
import {
  XmlExportOptions,
  XmlDialect,
  TagCasing,
  IndentSize,
  NullHandling,
  MultiSheetMode,
} from '@/types/converter';
import { Settings, Check, Code, FileText, Cpu, Braces } from 'lucide-react';

interface XmlOptionsPanelProps {
  options: XmlExportOptions;
  onChangeOptions: (updated: Partial<XmlExportOptions>) => void;
  sheetCount: number;
}

export function XmlOptionsPanel({
  options,
  onChangeOptions,
  sheetCount,
}: XmlOptionsPanelProps) {
  const dialects: { id: XmlDialect; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'standard',
      label: 'Standard Elements',
      desc: '<record><name>Value</name></record>',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      id: 'attributes',
      label: 'Attribute-based',
      desc: '<record name="Value" price="29.9" />',
      icon: <Code className="h-4 w-4" />,
    },
    {
      id: 'excel2003',
      label: 'Excel 2003 XML',
      desc: 'SpreadsheetML (Native Excel XML)',
      icon: <Cpu className="h-4 w-4" />,
    },
    {
      id: 'custom',
      label: 'Custom Schema',
      desc: 'Custom root, tags, namespaces',
      icon: <Braces className="h-4 w-4" />,
    },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            XML Output Configuration & Dialects
          </h4>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Dialect Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            XML Dialect / Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dialects.map((d) => {
              const isSelected = options.dialect === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onChangeOptions({ dialect: d.id })}
                  className={`flex items-start gap-2.5 p-2.5 text-left rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div
                    className={`mt-0.5 p-1 rounded ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {d.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                      {d.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                      {d.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tag Names & Casing */}
        {options.dialect !== 'excel2003' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Root Element Tag
              </label>
              <input
                type="text"
                value={options.rootTag}
                onChange={(e) => onChangeOptions({ rootTag: e.target.value })}
                placeholder="dataset"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Record / Row Tag
              </label>
              <input
                type="text"
                value={options.rowTag}
                onChange={(e) => onChangeOptions({ rowTag: e.target.value })}
                placeholder="record"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Tag Casing Style
              </label>
              <select
                value={options.casing}
                onChange={(e) =>
                  onChangeOptions({ casing: e.target.value as TagCasing })
                }
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="preserve">Preserve Original (Sanitized)</option>
                <option value="snake">snake_case</option>
                <option value="camel">camelCase</option>
                <option value="kebab">kebab-case</option>
                <option value="pascal">PascalCase</option>
                <option value="upper_snake">UPPER_SNAKE_CASE</option>
              </select>
            </div>
          </div>
        )}

        {/* Multi-Sheet & Indentation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Worksheet Scope
            </label>
            <select
              value={options.multiSheetMode}
              onChange={(e) =>
                onChangeOptions({
                  multiSheetMode: e.target.value as MultiSheetMode,
                })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="single_sheet">Active Sheet Only</option>
              <option value="merge_all">
                Merge All Sheets ({sheetCount}) into Single XML
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Indentation & Spacing
            </label>
            <select
              value={options.indent}
              onChange={(e) =>
                onChangeOptions({ indent: e.target.value as IndentSize })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="2">2 Spaces (Standard)</option>
              <option value="4">4 Spaces (Readable)</option>
              <option value="tab">Tab</option>
              <option value="minified">Minified (Compact single-line)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Null / Empty Cell Values
            </label>
            <select
              value={options.nullHandling}
              onChange={(e) =>
                onChangeOptions({
                  nullHandling: e.target.value as NullHandling,
                })
              }
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="omit">Omit Tag (Cleanest)</option>
              <option value="empty">Self-Closing Tag &lt;tag/&gt;</option>
              <option value="xsi_nil">W3C Schema xsi:nil=&quot;true&quot;</option>
            </select>
          </div>
        </div>

        {/* Advanced Toggles & Namespaces */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includeDeclaration}
                onChange={(e) =>
                  onChangeOptions({ includeDeclaration: e.target.checked })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                &lt;?xml version=&quot;1.0&quot; encoding=&quot;{options.encoding}&quot;?&gt;
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) =>
                  onChangeOptions({ includeMetadata: e.target.checked })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                Include Timestamp &amp; Source File in Root Attributes
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.wrapStringsInCdata}
                onChange={(e) =>
                  onChangeOptions({ wrapStringsInCdata: e.target.checked })
                }
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
              />
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">
                Wrap text in &lt;![CDATA[ ... ]]&gt;
              </span>
            </label>
          </div>

          {/* Custom Namespace */}
          {options.dialect !== 'excel2003' && (
            <div className="pt-1">
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Custom XML Namespace (Optional xmlns URI)
              </label>
              <input
                type="text"
                value={options.customNamespace || ''}
                onChange={(e) =>
                  onChangeOptions({ customNamespace: e.target.value })
                }
                placeholder="http://example.com/schema/v1"
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
