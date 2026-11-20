import { describe, expect, it } from 'vitest';
import { PATHS } from './routes';

describe('PATHS', () => {
  it('builds family detail url', () => {
    expect(PATHS.admin.family('abc')).toBe('/admin/families/abc');
  });
  it('exposes kid root', () => {
    expect(PATHS.kid.root).toBe('/kid');
  });
  it('splits catalog into its own screens', () => {
    expect(PATHS.admin.subjects).toBe('/admin/catalog/subjects');
    expect(PATHS.admin.grades).toBe('/admin/catalog/grades');
    expect(PATHS.admin.topics).toBe('/admin/catalog/topics');
  });
  it('builds question, quiz, and plugin urls', () => {
    expect(PATHS.admin.questions).toBe('/admin/questions');
    expect(PATHS.admin.newQuestion).toBe('/admin/questions/new');
    expect(PATHS.admin.question('abc')).toBe('/admin/questions/abc');
    expect(PATHS.admin.quizzes).toBe('/admin/quizzes');
    expect(PATHS.admin.newQuiz).toBe('/admin/quizzes/new');
    expect(PATHS.admin.quiz('abc')).toBe('/admin/quizzes/abc');
    expect(PATHS.admin.plugins).toBe('/admin/plugins');
    expect(PATHS.admin.settings).toBe('/admin/settings');
    expect(PATHS.admin.roles).toBe('/admin/access/roles');
    expect(PATHS.admin.role('abc')).toBe('/admin/access/roles/abc');
    expect(PATHS.admin.users).toBe('/admin/access/users');
  });
  it('builds assignment urls for admin, parent, and kid', () => {
    expect(PATHS.admin.assignments).toBe('/admin/assignments');
    expect(PATHS.admin.assignment('abc')).toBe('/admin/assignments/abc');
    expect(PATHS.parent.assignment('abc')).toBe('/parent/assignments/abc');
    expect(PATHS.kid.assignment('abc')).toBe('/kid/a/abc');
  });
});
