'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Globe } from 'lucide-react';

interface ApiDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiDocumentationModal({
  isOpen,
  onClose,
}: ApiDocumentationModalProps) {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'node'>('curl');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const curlExample = `curl -X POST "https://your-domain.com/api/convert" \\
  -F "file=@/path/to/spreadsheet.xlsx" \\
  -F "dialect=standard" \\
  -F "rootTag=inventory" \\
  -F "rowTag=item" \\
  -F "casing=snake" \\
  -o "output.xml"`;

  const pythonExample = `import requests

url = "https://your-domain.com/api/convert"
files = {
    'file': open('inventory.xlsx', 'rb')
}
data = {
    'dialect': 'standard',
    'rootTag': 'dataset',
    'rowTag': 'record',
    'casing': 'snake',
    'multiSheetMode': 'single_sheet'
}

response = requests.post(url, files=files, data=data)

with open('output.xml', 'w', encoding='utf-8') as f:
    f.write(response.text)

print("Saved output.xml successfully!")`;

  const nodeExample = `import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function convertExcelToXml() {
  const form = new FormData();
  form.append('file', fs.createReadStream('inventory.xlsx'));
  form.append('dialect', 'standard');
  form.append('rootTag': 'dataset');
  form.append('rowTag': 'record');

  const res = await fetch('https://your-domain.com/api/convert', {
    method: 'POST',
    body: form,
  });

  const xmlText = await res.text();
  fs.writeFileSync('output.xml', xmlText, 'utf-8');
  console.log('Conversion complete!');
}

convertExcelToXml();`;

  const getCode = () => {
    switch (activeTab) {
      case 'curl':
        return curlExample;
      case 'python':
        return pythonExample;
      case 'node':
        return nodeExample;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                REST API &amp; Automation Guide
              </h3>
              <p className="text-[11px] text-slate-500">
                POST /api/convert endpoint specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 font-mono text-xs rounded-lg transition-colors ${
                  activeTab === 'curl'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1 font-mono text-xs rounded-lg transition-colors ${
                  activeTab === 'python'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveTab('node')}
                className={`px-3 py-1 font-mono text-xs rounded-lg transition-colors ${
                  activeTab === 'node'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                Node.js
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-lg bg-slate-950 p-3.5 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
            <pre>{getCode()}</pre>
          </div>

          {/* Parameters table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
              Supported Form-Data Parameters
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2 font-mono">Field</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">file</td>
                    <td className="p-2 font-mono">File</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      The Excel binary file (.xlsx, .xls, .csv). Required.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">dialect</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      &apos;standard&apos; | &apos;attributes&apos; | &apos;excel2003&apos; (Default: standard)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">rootTag</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      Name of the root enclosing XML tag (Default: &quot;dataset&quot;)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">rowTag</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      Name of each row XML tag (Default: &quot;record&quot;)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono text-emerald-600 dark:text-emerald-400">casing</td>
                    <td className="p-2 font-mono">string</td>
                    <td className="p-2 text-slate-600 dark:text-slate-400">
                      &apos;snake&apos; | &apos;camel&apos; | &apos;kebab&apos; | &apos;pascal&apos; | &apos;preserve&apos;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
