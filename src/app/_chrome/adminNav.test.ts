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
    expect(activeNav(PATHS.admin.plugins)).toBe('plugins');
    expect(activeNav(PATHS.admin.catalog)).toBeNull();
    expect(activeNav('/parent')).toBeNull();
  });
});
