export function permissionDiff(
  current: string[],
  next: string[],
): { add: string[]; remove: string[] } {
  const currentSet = new Set(current);
  const nextSet = new Set(next);

  const add: string[] = [];
  for (const item of nextSet) {
    if (!currentSet.has(item)) {
      add.push(item);
    }
  }

  const remove: string[] = [];
  for (const item of currentSet) {
    if (!nextSet.has(item)) {
      remove.push(item);
    }
  }

  add.sort();
  remove.sort();

  return { add, remove };
}
