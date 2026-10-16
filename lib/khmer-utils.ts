/**
 * Utilities for Khmer Unicode script and Mojibake (Windows-1252 / ISO-8859-1) repair.
 */

const WIN1252_MAP: Record<number, number> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

/**
 * Checks if a string contains native Khmer Unicode characters (U+1780 to U+17FF).
 */
export function hasKhmer(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return /[\u1780-\u17FF]/.test(text);
}

/**
 * Checks if a string appears to be Khmer UTF-8 bytes misread as Windows-1252 / ISO-8859-1
 * (starts with or heavily contains 'á' (0xE1) followed by high-byte characters).
 */
export function isKhmerMojibake(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return /á[žŸ”‰’‡¸‘†“·•–—…\u0080-\u00FF\u0100-\u02FF\u2000-\u203F]/.test(text);
}

/**
 * Automatically repairs Khmer text that suffered from Mojibake (UTF-8 bytes decoded as Windows-1252/Latin-1).
 * Example: 'ážˆáŸ’áž˜áŸ„áŸ‡áž‘áŸ†áž“áž·áž‰' -> 'ឈ្មោះទំនិញ'
 */
export function fixKhmerMojibake(text: string): string {
  if (!text || typeof text !== 'string') return text;

  // If already native Khmer and does not contain suspicious 'á' sequences, return as-is
  if (hasKhmer(text) && !text.includes('á') && !text.includes('\u00e1')) {
    return text;
  }

  // Only attempt repair if text contains 0xE1 ('á')
  if (!text.includes('á') && !text.includes('\u00e1')) {
    return text;
  }

  try {
    const bytes: number[] = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      if (WIN1252_MAP[code] !== undefined) {
        bytes.push(WIN1252_MAP[code]);
      } else if (code <= 0xff) {
        bytes.push(code);
      } else {
        // Unknown multi-byte character, cannot reverse safely
        return text;
      }
    }

    const decoder = new TextDecoder('utf-8', { fatal: true });
    const decoded = decoder.decode(new Uint8Array(bytes));

    if (hasKhmer(decoded)) {
      return decoded;
    }
  } catch {
    // If not valid UTF-8 sequence, retain original string
  }

  return text;
}
