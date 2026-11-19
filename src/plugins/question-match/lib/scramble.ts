/**
 * 32-bit FNV-1a hash algorithm.
 * Deterministic and fast hash of string to uint32.
 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface ScrambleResult {
  items: string[];
  order: number[];
}

/**
 * Pure, deterministic scramble function for question items.
 * Sorts indices by FNV-1a hash of (text + index).
 * If the resulting permutation equals the original order and n >= 2, rotates by 1 step.
 * Returns `items` (scrambled right options) and `order` (mapping from original right index to scrambled right index).
 */
export function scramble(correctItems: string[]): ScrambleResult {
  const n = correctItems.length;
  if (n <= 1) {
    return {
      items: [...correctItems],
      order: correctItems.map((_, i) => i),
    };
  }

  const hashes = correctItems.map((text, index) => fnv1a(`${text}${index}`));
  let perm = Array.from({ length: n }, (_, i) => i);

  perm.sort((a, b) => {
    const diff = hashes[a]! - hashes[b]!;
    return diff !== 0 ? diff : a - b;
  });

  const isIdentical = perm.every((val, idx) => val === idx);
  if (isIdentical) {
    perm = [...perm.slice(1), perm[0]!];
  }

  const items = perm.map((origIdx) => correctItems[origIdx]!);
  const order = Array.from({ length: n }, (_, k) => perm.indexOf(k));

  return { items, order };
}
