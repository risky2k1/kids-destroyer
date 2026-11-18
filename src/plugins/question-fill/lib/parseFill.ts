const BLANK = /\[\[([\s\S]*?)\]\]/g;

/** Inverse of a successful parse: `[[]]` plus blanks → `[[4|bốn]]`. */
export function composeFill(text: string, blanks: string[][]): string {
  let index = 0;
  return text.replaceAll('[[]]', () => `[[${(blanks[index++] ?? []).join('|')}]]`);
}

export type ParseFillOk = { text: string; blanks: string[][] };
export type ParseFillResult = ParseFillOk | { error: string };

/** `Con mèo có [[4|bốn]] chân` → text with `[[]]` and blanks `[['4','bốn']]`. */
export function parseFill(src: string): ParseFillResult {
  const blanks: string[][] = [];
  const text = src.replace(BLANK, (_match, inner: string) => {
    blanks.push(
      inner
        .split('|')
        .map((part) => part.trim())
        .filter((part) => part.length > 0),
    );
    return '[[]]';
  });
  if (blanks.length === 0) return { error: 'Cần ít nhất một chỗ trống [[...]]' };
  if (text.replaceAll('[[]]', '').includes('[[')) return { error: 'Chỗ trống chưa đóng ]]' };
  if (blanks.some((blank) => blank.length === 0)) {
    return { error: 'Mỗi chỗ trống cần ít nhất một đáp án' };
  }
  return { text, blanks };
}
