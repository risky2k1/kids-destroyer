export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir;
  if (index < 0 || index >= list.length || next < 0 || next >= list.length) return list;
  const copy = list.slice();
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item!);
  return copy;
}
