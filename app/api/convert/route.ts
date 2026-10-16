import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/lib/excel-parser';
import { generateXmlFromWorkbook } from '@/lib/xml-generator';
import { XmlExportOptions, XmlDialect, TagCasing, ColumnMapping } from '@/types/converter';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided in form-data. Key "file" is required.' },
        { status: 400 }
      );
    }

    const dialect = (formData.get('dialect') as XmlDialect) || 'standard';
    const rootTag = (formData.get('rootTag') as string) || 'dataset';
    const rowTag = (formData.get('rowTag') as string) || 'record';
    const casing = (formData.get('casing') as TagCasing) || 'snake';
    const multiSheetMode = (formData.get('multiSheetMode') as any) || 'single_sheet';
    const indent = (formData.get('indent') as any) || '2';
    const nullHandling = (formData.get('nullHandling') as any) || 'omit';

    // Parse uploaded workbook
    const arrayBuffer = await file.arrayBuffer();
    const workbook = await parseExcelFile(arrayBuffer, file.name);

    // Build default column mappings for active sheet
    const activeSheet = workbook.sheets[workbook.activeSheetName];
    const columnMappings: Record<string, ColumnMapping> = {};

    if (activeSheet) {
      activeSheet.headers.forEach((h) => {
        columnMappings[h] = {
          originalHeader: h,
          targetTag: h,
          type: 'auto',
          isAttribute: dialect === 'attributes',
          isRowId: false,
          include: true,
        };
      });
    }

    const options: XmlExportOptions = {
      dialect,
      rootTag,
      rowTag,
      casing,
      includeDeclaration: true,
      encoding: 'UTF-8',
      standalone: false,
      includeMetadata: true,
      indent,
      nullHandling,
      multiSheetMode,
      columnMappings,
      wrapStringsInCdata: false,
      escapeEntities: true,
    };

    const result = generateXmlFromWorkbook(workbook, options);

    const safeXmlName = file.name.replace(/\.[^/.]+$/, '') + '.xml';
    const utf8Content = '\uFEFF' + result.xml;

    return new NextResponse(utf8Content, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeXmlName)}"`,
        'X-Total-Lines': String(result.lineCount),
        'X-Is-Valid-Xml': String(result.isValid),
      },
    });
  } catch (err: any) {
    console.error('API /api/convert error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to parse Excel or generate XML' },
      { status: 500 }
    );
  }
}
