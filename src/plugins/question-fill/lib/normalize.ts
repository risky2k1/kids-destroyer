/** Trim, collapse whitespace, lowercase, keep Vietnamese diacritics, NFC. */
export function normalizeFill(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi').normalize('NFC');
}
