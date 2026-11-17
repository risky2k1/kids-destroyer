import { describe, expect, it } from 'vitest';
import { canEnter } from './access';

describe('canEnter', () => {
  const admin = { role: 'admin', familyId: null } as const;
  const parent = { role: 'parent', familyId: 'f1' } as const;
  const orphan = { role: 'parent', familyId: null } as const;

  it('admin enters admin and parent areas, not kid mode', () => {
    expect(canEnter('admin', admin)).toBe(true);
    expect(canEnter('parent', admin)).toBe(true);
    expect(canEnter('kid', admin)).toBe(false);
  });

  it('parent with a family enters parent and kid, not admin', () => {
    expect(canEnter('admin', parent)).toBe(false);
    expect(canEnter('parent', parent)).toBe(true);
    expect(canEnter('kid', parent)).toBe(true);
  });

  it('parent without family cannot enter kid mode', () => {
    expect(canEnter('kid', orphan)).toBe(false);
  });
});
