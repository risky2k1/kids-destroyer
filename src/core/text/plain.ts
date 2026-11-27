// Mathematical Alphanumeric Symbols: 13 styles × (A–Z a–z), then 5 digit runs.
// Reserved holes inside those runs live outside U+1D400 as letterlike symbols.
const HOLES: Record<number, string> = {
  0x2102: 'C',
  0x210a: 'g',
  0x210b: 'H',
  0x210c: 'H',
  0x210d: 'H',
  0x210e: 'h',
  0x2110: 'I',
  0x2111: 'I',
  0x2112: 'L',
  0x2115: 'N',
  0x2119: 'P',
  0x211a: 'Q',
  0x211b: 'R',
  0x211c: 'R',
  0x211d: 'R',
  0x2124: 'Z',
  0x2128: 'Z',
  0x212c: 'B',
  0x212d: 'C',
  0x212f: 'e',
  0x2130: 'E',
  0x2131: 'F',
  0x2133: 'M',
  0x2134: 'o',
};

const LATIN_START = 0x1d400;
const LATIN_STYLES = 13;
const LETTERS_PER_STYLE = 52;
const DIGIT_START = 0x1d7ce;
const DIGIT_RUN = 50;

function foldMathAlphanumeric(codePoint: number): string | undefined {
  const hole = HOLES[codePoint];
  if (hole) return hole;

  const latin = codePoint - LATIN_START;
  if (latin >= 0 && latin < LATIN_STYLES * LETTERS_PER_STYLE) {
    const letter = latin % LETTERS_PER_STYLE;
    const base = letter < 26 ? 0x41 : 0x61;
    return String.fromCharCode(base + (letter % 26));
  }

  const digit = codePoint - DIGIT_START;
  if (digit >= 0 && digit < DIGIT_RUN) return String.fromCharCode(0x30 + (digit % 10));

  return undefined;
}

/** NFKC, then fold styled Latin letters and digits. Keeps case, marks, and emoji. */
export function plainText(value: string): string {
  let folded = '';
  for (const char of value.normalize('NFKC')) {
    const codePoint = char.codePointAt(0);
    folded += codePoint === undefined ? char : (foldMathAlphanumeric(codePoint) ?? char);
  }
  return folded;
}

/** `plainText` for strings; every other value is returned unchanged. */
export function asPlain(value: unknown): unknown {
  return typeof value === 'string' ? plainText(value) : value;
}
