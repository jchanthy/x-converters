import * as XLSX from 'xlsx';
import { WorkbookData, ExcelSheetData } from '@/types/converter';
import { fixKhmerMojibake } from '@/lib/khmer-utils';

/**
 * Parses an ArrayBuffer or File into WorkbookData with full UTF-8 & Khmer Unicode repair.
 */
export async function parseExcelFile(
  fileOrBuffer: File | ArrayBuffer,
  fileName: string = 'workbook.xlsx'
): Promise<WorkbookData> {
  let arrayBuffer: ArrayBuffer;
  let fileSize = 0;

  if (fileOrBuffer instanceof File) {
    fileName = fixKhmerMojibake(fileOrBuffer.name);
    fileSize = fileOrBuffer.size;
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    fileName = fixKhmerMojibake(fileName);
    arrayBuffer = fileOrBuffer;
    fileSize = arrayBuffer.byteLength;
  }

  // Read workbook with explicit UTF-8 codepage (65001) to protect Khmer and Unicode characters
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false,
    codepage: 65001,
  });

  const rawSheetNames = workbook.SheetNames || [];
  if (rawSheetNames.length === 0) {
    throw new Error('No worksheets found in this Excel file.');
  }

  const sheetNames = rawSheetNames.map((s) => fixKhmerMojibake(s));
  const sheets: Record<string, ExcelSheetData> = {};

  rawSheetNames.forEach((rawSheetName, sheetIdx) => {
    const worksheet = workbook.Sheets[rawSheetName];
    if (!worksheet) return;

    const cleanSheetName = sheetNames[sheetIdx];

    // Convert sheet to JSON rows with headers
    const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });

    // Extract headers: find all unique keys across all rows
    const headerSet = new Set<string>();

    // Also inspect the sheet range directly to get header row order
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ c: C, r: range.s.r });
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== '') {
        const valStr = fixKhmerMojibake(String(cell.v).trim());
        if (valStr) headerSet.add(valStr);
      }
    }

    // Fallback: collect from JSON row keys and clean rows
    const cleanedRows: Record<string, any>[] = [];

    rawData.forEach((row) => {
      const cleanRow: Record<string, any> = {};
      Object.entries(row).forEach(([key, val]) => {
        const cleanKey = fixKhmerMojibake(key);
        headerSet.add(cleanKey);

        if (typeof val === 'string') {
          cleanRow[cleanKey] = fixKhmerMojibake(val);
        } else {
          cleanRow[cleanKey] = val;
        }
      });
      cleanedRows.push(cleanRow);
    });

    let headers = Array.from(headerSet);

    // If headers is empty, generate generic columns
    if (headers.length === 0 && cleanedRows.length > 0) {
      const firstRowKeys = Object.keys(cleanedRows[0]);
      headers = firstRowKeys.length > 0 ? firstRowKeys : ['Column_1'];
    }

    sheets[cleanSheetName] = {
      name: cleanSheetName,
      headers,
      rows: cleanedRows,
      totalRows: cleanedRows.length,
      totalCols: headers.length,
    };
  });

  return {
    fileName,
    fileSize,
    sheetNames,
    activeSheetName: sheetNames[0],
    sheets,
  };
}
