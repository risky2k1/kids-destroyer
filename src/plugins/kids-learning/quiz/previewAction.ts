'use server';

import { requireAnyPermission } from '@/core/auth/session';
import { getQuizPreview, type QuizPreviewData } from './queries';

export async function loadQuizPreview(id: string): Promise<QuizPreviewData | null> {
  await requireAnyPermission(['quizzes.manage', 'quizzes.author', 'assignments.manage']);
  return getQuizPreview(id);
}
