import { describe, expect, it } from 'vitest';
import { PATHS } from '@/core/routes';
import { activeNav } from './adminNav';

describe('activeNav', () => {
  it('picks the admin screen from the pathname', () => {
    expect(activeNav(PATHS.admin.root)).toBe('home');
    expect(activeNav(PATHS.admin.subjects)).toBe('subjects');
    expect(activeNav(PATHS.admin.topics)).toBe('topics');
    expect(activeNav(PATHS.admin.families)).toBe('families');
    expect(activeNav(PATHS.admin.family('abc'))).toBe('families');
    expect(activeNav(PATHS.admin.question('x'))).toBe('questions');
    expect(activeNav(PATHS.admin.quiz('x'))).toBe('quizzes');
    expect(activeNav(PATHS.admin.assignments)).toBe('assignments');
    expect(activeNav(PATHS.admin.assignment('x'))).toBe('assignments');
    expect(activeNav(PATHS.admin.plugins)).toBe('plugins');
    expect(activeNav(PATHS.admin.modules)).toBe('modules');
    expect(activeNav(PATHS.admin.media)).toBe('media');
    expect(activeNav(PATHS.admin.settings)).toBe('settings');
    expect(activeNav(PATHS.admin.catalog)).toBeNull();
    expect(activeNav('/parent')).toBeNull();
  });

  it('filters out disabled modules in adminNav', async () => {
    const { adminNav } = await import('./adminNav');
    const full = adminNav([]);
    const withoutKids = adminNav(['kids-learning']);
    const fullKeys = full.flatMap((s) => s.items.map((i) => i.key));
    const withoutKidsKeys = withoutKids.flatMap((s) => s.items.map((i) => i.key));

    expect(fullKeys).toContain('kids-learning');
    expect(fullKeys).toContain('media');
    expect(withoutKidsKeys).not.toContain('kids-learning');
    expect(withoutKidsKeys).toContain('modules');
  });
});
