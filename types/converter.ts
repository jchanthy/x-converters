export type XmlDialect = 'standard' | 'attributes' | 'excel2003' | 'nested' | 'custom';

export type TagCasing = 'preserve' | 'snake' | 'camel' | 'kebab' | 'pascal' | 'upper_snake';

export type ColumnDataType = 'auto' | 'string' | 'number' | 'boolean' | 'date' | 'cdata';

export type NullHandling = 'omit' | 'empty' | 'xsi_nil';

export type IndentSize = '2' | '4' | 'tab' | 'minified';

export type MultiSheetMode = 'single_sheet' | 'merge_all';

export interface ColumnMapping {
  originalHeader: string;
  targetTag: string;
  type: ColumnDataType;
  isAttribute: boolean;
  isRowId: boolean;
  include: boolean;
  defaultValue?: string;
  dateFormat?: string;
}

export interface ExcelSheetData {
  name: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  totalCols: number;
}

export interface WorkbookData {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  activeSheetName: string;
  sheets: Record<string, ExcelSheetData>;
}

export interface XmlExportOptions {
  dialect: XmlDialect;
  rootTag: string;
  rowTag: string;
  casing: TagCasing;
  includeDeclaration: boolean;
  encoding: string;
  standalone: boolean;
  includeMetadata: boolean;
  indent: IndentSize;
  nullHandling: NullHandling;
  customNamespace?: string;
  multiSheetMode: MultiSheetMode;
  columnMappings: Record<string, ColumnMapping>;
  wrapStringsInCdata: boolean;
  escapeEntities: boolean;
  exportTimestamp?: string;
}

export interface ConversionResult {
  xml: string;
  lineCount: number;
  sizeBytes: number;
  isValid: boolean;
  validationError?: string;
  sheetStats: {
    sheetName: string;
    rowCount: number;
    colCount: number;
  }[];
  generatedAt: string;
}
