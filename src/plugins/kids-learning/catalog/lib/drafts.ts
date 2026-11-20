export type Draft = { name: string; sort: string };

/** Rows whose draft differs from the saved item (edited back to the original = unchanged). */
export function changedRows(
  items: { id: string; name: string; sort: number }[],
  drafts: Record<string, Draft>,
): ({ id: string } & Draft)[] {
  return items.flatMap((item) => {
    const d = drafts[item.id];
    if (!d || (d.name === item.name && d.sort === String(item.sort))) return [];
    return [{ id: item.id, ...d }];
  });
}
