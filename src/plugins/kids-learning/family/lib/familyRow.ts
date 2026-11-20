type Raw = {
  id: string;
  name: string;
  profiles: { display_name: string }[] | null;
  kids: { display_name: string; grades: { name: string } | null }[] | null;
};

export type FamilyRow = {
  id: string;
  name: string;
  parents: string[];
  kids: string[];
  grades: string[];
};

/** Parents, kids, and unique grade names (first-seen order) for one family row. */
export function familyRow(raw: Raw): FamilyRow {
  const grades: string[] = [];
  for (const kid of raw.kids ?? []) {
    const name = kid.grades?.name;
    if (name && !grades.includes(name)) grades.push(name);
  }
  return {
    id: raw.id,
    name: raw.name,
    parents: (raw.profiles ?? []).map((profile) => profile.display_name),
    kids: (raw.kids ?? []).map((kid) => kid.display_name),
    grades,
  };
}
