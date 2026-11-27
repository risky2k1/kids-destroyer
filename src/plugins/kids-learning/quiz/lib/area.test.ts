import { describe, expect, it } from 'vitest';
import { areaPaths, readArea } from './area';

describe('areaPaths', () => {
  it('builds the parent quiz path', () => {
    expect(areaPaths('parent').quiz('x')).toBe('/parent/quizzes/x');
  });

  it('builds the admin new-question path', () => {
    expect(areaPaths('admin').newQuestion).toBe('/admin/questions/new');
  });
});

describe('readArea', () => {
  it('reads parent', () => {
    const fd = new FormData();
    fd.set('area', 'parent');
    expect(readArea(fd)).toBe('parent');
  });

  it('maps anything else to admin', () => {
    const fd = new FormData();
    fd.set('area', 'evil');
    expect(readArea(fd)).toBe('admin');
  });
});
