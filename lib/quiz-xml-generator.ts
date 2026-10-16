import { WorkbookData, ExcelSheetData } from '@/types/converter';
import { fixKhmerMojibake } from '@/lib/khmer-utils';
import { escapeXml } from '@/lib/xml-generator';

export interface QuizQuestion {
  name: string;
  questionText: string;
  type: string;
  answers: {
    text: string;
    fraction: number;
    feedback?: string;
  }[];
}

/**
 * Checks if the worksheet headers resemble a Quiz (has question and answer/option columns).
 */
export function isQuizSpreadsheet(headers: string[]): boolean {
  if (!headers || headers.length < 2) return false;

  const normalized = headers.map((h) => fixKhmerMojibake(h).toLowerCase().trim());

  const hasQuestionCol = normalized.some((h) =>
    h.includes('question') ||
    h.includes('prompt') ||
    h.includes('សំណួរ') ||
    h.includes('ខ្លឹមសារ') ||
    h === 'q' ||
    h === 'q_text' ||
    h === 'title'
  );

  const hasOptionCol = normalized.some((h) =>
    h.includes('option') ||
    h.includes('choice') ||
    h.includes('answer') ||
    h.includes('ចម្លើយ') ||
    h.includes('ជម្រើស') ||
    h === 'a' ||
    h === 'b' ||
    h === 'ក' ||
    h === 'ខ'
  );

  return hasQuestionCol || hasOptionCol;
}

/**
 * Parses quiz rows into structured QuizQuestion array.
 */
export function extractQuizQuestions(sheet: ExcelSheetData): QuizQuestion[] {
  const headers = sheet.headers;
  const normalizedHeaders = headers.map((h) => ({
    original: h,
    clean: fixKhmerMojibake(h).toLowerCase().trim(),
  }));

  // Identify Question Text column
  const qTextHeader =
    normalizedHeaders.find((h) =>
      h.clean.includes('question_text') ||
      h.clean.includes('questiontext') ||
      h.clean.includes('question text') ||
      h.clean.includes('សំណួរ') ||
      h.clean.includes('ខ្លឹមសារ') ||
      h.clean === 'question'
    )?.original ||
    normalizedHeaders.find((h) => h.clean.includes('question') || h.clean.includes('prompt'))?.original ||
    headers[0];

  // Identify Question Name/ID column (optional)
  const qNameHeader = normalizedHeaders.find((h) =>
    h.clean === 'name' ||
    h.clean === 'q_name' ||
    h.clean === 'question_name' ||
    h.clean === 'title' ||
    h.clean === 'id' ||
    h.clean === 'កូដ' ||
    h.clean === 'ល.រ'
  )?.original;

  // Identify Correct Answer column
  const correctHeader = normalizedHeaders.find((h) =>
    h.clean.includes('correct') ||
    h.clean.includes('answer_key') ||
    h.clean.includes('key') ||
    h.clean.includes('ចម្លើយត្រឹមត្រូវ') ||
    h.clean.includes('ចម្លើយពិត') ||
    h.clean === 'answer' ||
    h.clean === 'ចម្លើយ'
  )?.original;

  // Identify Option columns (Option A, Option B, etc.)
  const optionHeaders = normalizedHeaders.filter((h) => {
    if (h.original === qTextHeader || h.original === qNameHeader || h.original === correctHeader) {
      return false;
    }
    const c = h.clean;
    return (
      c.includes('option') ||
      c.includes('choice') ||
      c.includes('ans_') ||
      c.includes('answer_') ||
      c.includes('ជម្រើស') ||
      c.startsWith('ចម្លើយ_') ||
      c === 'a' || c === 'b' || c === 'c' || c === 'd' || c === 'e' ||
      c === 'ក' || c === 'ខ' || c === 'គ' || c === 'ឃ' || c === 'ង' ||
      c === '1' || c === '2' || c === '3' || c === '4'
    );
  });

  // Fallback: If no explicit option headers matched, take all columns except question and correct
  const effectiveOptionHeaders =
    optionHeaders.length >= 2
      ? optionHeaders.map((o) => o.original)
      : headers.filter((h) => h !== qTextHeader && h !== qNameHeader && h !== correctHeader);

  return sheet.rows.map((row, index) => {
    const rawQText = String(row[qTextHeader] || `Question ${index + 1}`).trim();
    const cleanQText = fixKhmerMojibake(rawQText);

    const rawQName = qNameHeader && row[qNameHeader]
      ? String(row[qNameHeader]).trim()
      : `Question ${index + 1}`;
    const cleanQName = fixKhmerMojibake(rawQName);

    const rawCorrectVal = correctHeader && row[correctHeader] !== undefined
      ? fixKhmerMojibake(String(row[correctHeader]).trim().toLowerCase())
      : '';

    const answers: { text: string; fraction: number; feedback?: string }[] = [];

    effectiveOptionHeaders.forEach((optH, optIdx) => {
      const cellVal = row[optH];
      if (cellVal === null || cellVal === undefined || cellVal === '') return;

      let optText = fixKhmerMojibake(String(cellVal).trim());
      let isExplicitlyCorrect = false;

      // Check if option starts with * indicating correct answer (e.g. "*Generative AI")
      if (optText.startsWith('*')) {
        optText = optText.slice(1).trim();
        isExplicitlyCorrect = true;
      }

      // Check against correct answer column
      // Support matching by column letter (A, B, C, D), index (1, 2, 3, 4), Khmer (ក, ខ, គ, ឃ), or exact text
      const cleanHeaderName = fixKhmerMojibake(optH).toLowerCase();
      const colLetter = String.fromCharCode(65 + optIdx).toLowerCase(); // 'a', 'b', 'c', 'd'
      const colNum = String(optIdx + 1);
      const khmerLetters = ['ក', 'ខ', 'គ', 'ឃ', 'ង'];
      const khmerLetter = khmerLetters[optIdx] || '';

      const isMatch =
        isExplicitlyCorrect ||
        (rawCorrectVal !== '' &&
          (rawCorrectVal === colLetter ||
            rawCorrectVal === colNum ||
            rawCorrectVal === khmerLetter ||
            cleanHeaderName.includes(rawCorrectVal) ||
            rawCorrectVal === optText.toLowerCase() ||
            optText.toLowerCase().startsWith(rawCorrectVal)));

      answers.push({
        text: optText,
        fraction: isMatch ? 100 : 0,
      });
    });

    // If no option was marked correct, default the first answer to 100% so Moodle accepts it
    const hasAnyCorrect = answers.some((a) => a.fraction > 0);
    if (!hasAnyCorrect && answers.length > 0) {
      answers[0].fraction = 100;
    }

    return {
      name: cleanQName,
      questionText: cleanQText,
      type: 'multichoice',
      answers,
    };
  });
}

/**
 * Generates official Moodle XML quiz document that Moodle, Canvas, and Blackboard count & import.
 */
export function generateMoodleQuizXml(workbook: WorkbookData): {
  xml: string;
  questionCount: number;
} {
  const activeSheet = workbook.sheets[workbook.activeSheetName] || Object.values(workbook.sheets)[0];
  if (!activeSheet) {
    return { xml: '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n</quiz>', questionCount: 0 };
  }

  const questions = extractQuizQuestions(activeSheet);

  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<quiz>',
  ];

  questions.forEach((q) => {
    lines.push('  <question type="multichoice">');
    lines.push(`    <name><text>${escapeXml(q.name)}</text></name>`);
    lines.push('    <questiontext format="html">');
    lines.push(`      <text><![CDATA[<p>${q.questionText}</p>]]></text>`);
    lines.push('    </questiontext>');
    lines.push('    <generalfeedback format="html"><text></text></generalfeedback>');
    lines.push('    <defaultgrade>1.0000000</defaultgrade>');
    lines.push('    <penalty>0.3333333</penalty>');
    lines.push('    <hidden>0</hidden>');
    lines.push('    <idnumber></idnumber>');
    lines.push('    <single>true</single>');
    lines.push('    <shuffleanswers>true</shuffleanswers>');
    lines.push('    <answernumbering>abc</answernumbering>');
    lines.push('    <showstandardinstruction>0</showstandardinstruction>');
    lines.push('    <correctfeedback format="html"><text><![CDATA[<p>Your answer is correct.</p>]]></text></correctfeedback>');
    lines.push('    <partiallycorrectfeedback format="html"><text><![CDATA[<p>Your answer is partially correct.</p>]]></text></partiallycorrectfeedback>');
    lines.push('    <incorrectfeedback format="html"><text><![CDATA[<p>Your answer is incorrect.</p>]]></text></incorrectfeedback>');

    q.answers.forEach((ans) => {
      lines.push(`    <answer fraction="${ans.fraction}">`);
      lines.push(`      <text>${escapeXml(ans.text)}</text>`);
      lines.push('      <feedback format="html"><text></text></feedback>');
      lines.push('    </answer>');
    });

    lines.push('  </question>');
    lines.push('');
  });

  lines.push('</quiz>');

  return {
    xml: lines.join('\n').trim(),
    questionCount: questions.length,
  };
}
