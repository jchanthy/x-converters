import {
  XmlExportOptions,
  WorkbookData,
  ExcelSheetData,
  ConversionResult,
  TagCasing,
  ColumnMapping,
} from '@/types/converter';
import { fixKhmerMojibake } from '@/lib/khmer-utils';

/**
 * Sanitizes an arbitrary header or text to a valid XML tag/attribute name.
 * Supports Unicode letters including Khmer (ភាសាខ្មែរ), Latin, Cyrillic, Greek, etc.
 * XML tag names cannot start with numbers, cannot have spaces, and cannot contain special punctuation.
 */
export function sanitizeXmlName(rawName: string, casing: TagCasing = 'preserve'): string {
  if (!rawName || typeof rawName !== 'string') {
    return 'item';
  }

  let cleaned = fixKhmerMojibake(rawName).trim();

  // Replace invalid XML characters with underscore, while preserving Unicode letters (\p{L}),
  // marks (\p{M}) for Khmer vowels & coeng subscripts, numbers (\p{N}), and valid XML punctuation (_ . -)
  cleaned = cleaned.replace(/[^\p{L}\p{M}\p{N}_.-]/gu, '_');

  // Collapse multiple underscores
  cleaned = cleaned.replace(/_+/g, '_');

  // XML name cannot start with a number, hyphen, dot, or combining mark
  if (/^[0-9\p{N}.-]|^[\p{M}]/u.test(cleaned)) {
    cleaned = `col_${cleaned}`;
  }

  // Clean edges if not solely underscores
  if (cleaned.length > 1 && cleaned !== '_') {
    cleaned = cleaned.replace(/^_+|_+$/g, '');
  }

  if (cleaned.length === 0) {
    cleaned = 'column';
  }

  return applyCasing(cleaned, casing);
}

/**
 * Apply selected casing style to an XML identifier, preserving Unicode/Khmer scripts.
 */
export function applyCasing(str: string, casing: TagCasing): string {
  if (!str) return 'item';

  // Break into words on underscores, dashes, spaces, and camelCase transitions
  const words = str
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return str;

  const hasLatin = /[a-zA-Z]/.test(str);

  switch (casing) {
    case 'snake':
      return words
        .map((w) => (hasLatin ? w.toLowerCase() : w))
        .join('_');
    case 'kebab':
      return words
        .map((w) => (hasLatin ? w.toLowerCase() : w))
        .join('-');
    case 'camel':
      return words
        .map((w, i) => {
          if (!hasLatin) return w;
          return i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(hasLatin ? '' : '_');
    case 'pascal':
      return words
        .map((w) => {
          if (!hasLatin) return w;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(hasLatin ? '' : '_');
    case 'upper_snake':
      return words
        .map((w) => (hasLatin ? w.toUpperCase() : w))
        .join('_');
    case 'preserve':
    default:
      return str.replace(/\s+/g, '_');
  }
}

/**
 * Escapes special XML characters to prevent parsing errors.
 */
export function escapeXml(value: any): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? fixKhmerMojibake(value) : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Safely format cell values based on type definition.
 */
export function formatCellValue(
  value: any,
  mapping?: ColumnMapping,
  wrapCdata: boolean = false
): { formatted: string; isNull: boolean; rawType: string } {
  if (value === null || value === undefined || value === '') {
    return { formatted: '', isNull: true, rawType: 'null' };
  }

  const targetType = mapping?.type || 'auto';

  if (targetType === 'cdata' || wrapCdata) {
    const rawStr = typeof value === 'string' ? fixKhmerMojibake(value) : String(value);
    const safeCdata = rawStr.replace(/]]>/g, ']]]]><![CDATA[>');
    return { formatted: `<![CDATA[${safeCdata}]]>`, isNull: false, rawType: 'cdata' };
  }

  if (targetType === 'boolean') {
    const boolVal =
      value === true ||
      value === 1 ||
      String(value).toLowerCase() === 'true' ||
      String(value).toLowerCase() === 'yes';
    return { formatted: boolVal ? 'true' : 'false', isNull: false, rawType: 'boolean' };
  }

  if (targetType === 'number') {
    const num = Number(value);
    if (!isNaN(num)) {
      return { formatted: String(num), isNull: false, rawType: 'number' };
    }
  }

  if (targetType === 'date') {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return { formatted: value.toISOString(), isNull: false, rawType: 'date' };
    }
    // Check if Excel serial date number
    if (typeof value === 'number' && value > 10000 && value < 60000) {
      // Approximate Excel serial date
      const date = new Date(Math.round((value - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) {
        return { formatted: date.toISOString().split('T')[0], isNull: false, rawType: 'date' };
      }
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return { formatted: parsed.toISOString(), isNull: false, rawType: 'date' };
    }
  }

  // Auto or string fallback
  if (typeof value === 'boolean') {
    return { formatted: String(value), isNull: false, rawType: 'boolean' };
  }
  if (typeof value === 'number') {
    return { formatted: String(value), isNull: false, rawType: 'number' };
  }
  if (value instanceof Date) {
    return { formatted: value.toISOString(), isNull: false, rawType: 'date' };
  }

  return { formatted: escapeXml(value), isNull: false, rawType: 'string' };
}

/**
 * Returns indentation string for current level.
 */
function getIndent(level: number, indent: XmlExportOptions['indent']): string {
  if (indent === 'minified') return '';
  const spacing = indent === 'tab' ? '\t' : ' '.repeat(Number(indent) || 2);
  return spacing.repeat(level);
}

function getNewline(indent: XmlExportOptions['indent']): string {
  return indent === 'minified' ? '' : '\n';
}

/**
 * Core XML generation function supporting all dialects.
 */
export function generateXmlFromWorkbook(
  workbook: WorkbookData,
  options: XmlExportOptions
): ConversionResult {
  const nl = getNewline(options.indent);
  const isMinified = options.indent === 'minified';

  let xmlHeader = '';
  if (options.includeDeclaration) {
    const standaloneAttr = options.standalone ? ' standalone="yes"' : '';
    xmlHeader = `<?xml version="1.0" encoding="${options.encoding}"${standaloneAttr}?>${nl}`;
  }

  let xmlBody = '';

  // Handle Excel 2003 XML dialect
  if (options.dialect === 'excel2003') {
    xmlBody = generateExcel2003Xml(workbook, options);
  } else {
    // Standard, Attributes, or Custom dialects
    const sheetsToExport: ExcelSheetData[] =
      options.multiSheetMode === 'merge_all'
        ? workbook.sheetNames.map((s) => workbook.sheets[s]).filter(Boolean)
        : [workbook.sheets[workbook.activeSheetName] || Object.values(workbook.sheets)[0]];

    const rootTag = sanitizeXmlName(options.rootTag || 'dataset', options.casing);
    const rowTag = sanitizeXmlName(options.rowTag || 'record', options.casing);

    // Root element attributes
    let rootAttrs = '';
    if (options.customNamespace) {
      rootAttrs += ` xmlns="${escapeXml(options.customNamespace)}"`;
    }
    if (options.nullHandling === 'xsi_nil') {
      rootAttrs += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
    }
    if (options.includeMetadata) {
      const timestamp = options.exportTimestamp || '2026-03-15T12:00:00Z';
      rootAttrs += ` generatedAt="${timestamp}" source="${escapeXml(workbook.fileName)}"`;
    }

    const openRoot = `${getIndent(0, options.indent)}<${rootTag}${rootAttrs}>${nl}`;
    const closeRoot = `${getIndent(0, options.indent)}</${rootTag}>`;

    const sheetChunks: string[] = [];

    sheetsToExport.forEach((sheet) => {
      if (!sheet) return;
      const isMulti = options.multiSheetMode === 'merge_all' && sheetsToExport.length > 1;
      const sheetIndentLevel = isMulti ? 1 : 0;
      const rowIndentLevel = isMulti ? 2 : 1;
      const colIndentLevel = rowIndentLevel + 1;

      let sheetPrefix = '';
      let sheetSuffix = '';

      if (isMulti) {
        const sheetTag = sanitizeXmlName('sheet', options.casing);
        sheetPrefix = `${getIndent(sheetIndentLevel, options.indent)}<${sheetTag} name="${escapeXml(
          sheet.name
        )}" totalRows="${sheet.totalRows}">${nl}`;
        sheetSuffix = `${getIndent(sheetIndentLevel, options.indent)}</${sheetTag}>${nl}`;
      }

      const rowsXml: string[] = [];

      sheet.rows.forEach((row, rowIndex) => {
        // Collect attributes & child elements
        const attributes: string[] = [];
        const childElements: string[] = [];

        // Check for primary key / row id
        let rowIdAttr = '';

        sheet.headers.forEach((header) => {
          const mapping = options.columnMappings[header];
          if (mapping && !mapping.include) return;

          const rawVal = row[header];
          const tag = sanitizeXmlName(mapping?.targetTag || header, options.casing);
          const { formatted, isNull } = formatCellValue(
            rawVal,
            mapping,
            options.wrapStringsInCdata
          );

          if (mapping?.isRowId && !isNull) {
            rowIdAttr = ` id="${escapeXml(rawVal)}"`;
            return;
          }

          if (options.dialect === 'attributes' || mapping?.isAttribute) {
            // Attribute formatting
            if (!isNull) {
              attributes.push(`${tag}="${escapeXml(formatted)}"`);
            } else if (options.nullHandling === 'empty') {
              attributes.push(`${tag}=""`);
            }
          } else {
            // Element formatting
            if (!isNull) {
              childElements.push(
                `${getIndent(colIndentLevel, options.indent)}<${tag}>${formatted}</${tag}>`
              );
            } else {
              if (options.nullHandling === 'empty') {
                childElements.push(`${getIndent(colIndentLevel, options.indent)}<${tag}/>`);
              } else if (options.nullHandling === 'xsi_nil') {
                childElements.push(
                  `${getIndent(colIndentLevel, options.indent)}<${tag} xsi:nil="true"/>`
                );
              }
              // If 'omit', do not render
            }
          }
        });

        // Add auto row index if requested
        const rowAttrsStr = (rowIdAttr + (attributes.length ? ' ' + attributes.join(' ') : '')).trim();
        const rowOpenTag = rowAttrsStr ? `<${rowTag} ${rowAttrsStr}` : `<${rowTag}`;

        if (childElements.length === 0) {
          rowsXml.push(`${getIndent(rowIndentLevel, options.indent)}${rowOpenTag}/>`);
        } else {
          rowsXml.push(
            `${getIndent(rowIndentLevel, options.indent)}${rowOpenTag}>${nl}${childElements.join(
              nl
            )}${nl}${getIndent(rowIndentLevel, options.indent)}</${rowTag}>`
          );
        }
      });

      sheetChunks.push(`${sheetPrefix}${rowsXml.join(nl)}${nl}${sheetSuffix}`);
    });

    xmlBody = `${openRoot}${sheetChunks.join(nl)}${closeRoot}`;
  }

  const fullXml = `${xmlHeader}${xmlBody}`.trim();
  const lineCount = isMinified ? 1 : fullXml.split('\n').length;
  const sizeBytes = new TextEncoder().encode(fullXml).length;

  // Validate XML
  const { isValid, error } = validateXmlString(fullXml);

  return {
    xml: fullXml,
    lineCount,
    sizeBytes,
    isValid,
    validationError: error,
    sheetStats: workbook.sheetNames.map((s) => ({
      sheetName: s,
      rowCount: workbook.sheets[s]?.totalRows || 0,
      colCount: workbook.sheets[s]?.totalCols || 0,
    })),
    generatedAt: options.exportTimestamp || '2026-03-15T12:00:00Z',
  };
}

/**
 * Generates Microsoft Excel 2003 XML (SpreadsheetML) standard document.
 */
function generateExcel2003Xml(workbook: WorkbookData, options: XmlExportOptions): string {
  const nl = getNewline(options.indent);
  const sheetsToExport: ExcelSheetData[] =
    options.multiSheetMode === 'merge_all'
      ? workbook.sheetNames.map((s) => workbook.sheets[s]).filter(Boolean)
      : [workbook.sheets[workbook.activeSheetName] || Object.values(workbook.sheets)[0]];

  const lines: string[] = [
    `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"`,
    ` xmlns:o="urn:schemas-microsoft-com:office:office"`,
    ` xmlns:x="urn:schemas-microsoft-com:office:excel"`,
    ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"`,
    ` xmlns:html="http://www.w3.org/TR/REC-html40">`,
    `  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">`,
    `    <Author>XLSX to XML Converter</Author>`,
    `    <Created>${options.exportTimestamp || '2026-03-15T12:00:00Z'}</Created>`,
    `  </DocumentProperties>`,
    `  <Styles>`,
    `    <Style ss:ID="Default" ss:Name="Normal">`,
    `      <Alignment ss:Vertical="Bottom"/>`,
    `      <Borders/>`,
    `      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>`,
    `      <Interior/>`,
    `      <NumberFormat/>`,
    `      <Protection/>`,
    `    </Style>`,
    `    <Style ss:ID="HeaderStyle">`,
    `      <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>`,
    `      <Interior ss:Color="#1E293B" ss:Pattern="Solid"/>`,
    `    </Style>`,
    `  </Styles>`,
  ];

  sheetsToExport.forEach((sheet) => {
    lines.push(`  <Worksheet ss:Name="${escapeXml(sheet.name)}">`);
    lines.push(
      `    <Table ss:ExpandedColumnCount="${sheet.headers.length}" ss:ExpandedRowCount="${
        sheet.rows.length + 1
      }" x:FullColumns="1" x:FullRows="1">`
    );

    // Header Row
    lines.push(`      <Row ss:StyleID="HeaderStyle">`);
    sheet.headers.forEach((h) => {
      lines.push(
        `        <Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`
      );
    });
    lines.push(`      </Row>`);

    // Data Rows
    sheet.rows.forEach((row) => {
      lines.push(`      <Row>`);
      sheet.headers.forEach((h) => {
        const val = row[h];
        if (val === null || val === undefined || val === '') {
          lines.push(`        <Cell/>`);
        } else if (typeof val === 'number') {
          lines.push(
            `        <Cell><Data ss:Type="Number">${val}</Data></Cell>`
          );
        } else if (typeof val === 'boolean') {
          lines.push(
            `        <Cell><Data ss:Type="Boolean">${val ? 1 : 0}</Data></Cell>`
          );
        } else if (val instanceof Date) {
          lines.push(
            `        <Cell><Data ss:Type="DateTime">${val.toISOString()}</Data></Cell>`
          );
        } else {
          lines.push(
            `        <Cell><Data ss:Type="String">${escapeXml(val)}</Data></Cell>`
          );
        }
      });
      lines.push(`      </Row>`);
    });

    lines.push(`    </Table>`);
    lines.push(`  </Worksheet>`);
  });

  lines.push(`</Workbook>`);

  return lines.join(nl);
}

/**
 * Validates XML in the browser using DOMParser.
 */
export function validateXmlString(xmlString: string): { isValid: boolean; error?: string } {
  if (typeof window === 'undefined' || !window.DOMParser) {
    return { isValid: true };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'application/xml');
    const parserError = doc.getElementsByTagName('parsererror');

    if (parserError.length > 0) {
      return {
        isValid: false,
        error: parserError[0].textContent?.trim() || 'XML syntax parsing error detected',
      };
    }
    return { isValid: true };
  } catch (err: any) {
    return {
      isValid: false,
      error: err.message || 'XML parsing failed',
    };
  }
}
