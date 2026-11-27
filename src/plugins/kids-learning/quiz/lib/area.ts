import { PATHS } from '@/core/routes';

export type Area = 'admin' | 'parent';

export const AUTHOR_QUIZ = ['quizzes.manage', 'quizzes.author'] as const;
export const AUTHOR_QUESTION = ['questions.manage', 'quizzes.author'] as const;

export function areaPaths(area: Area) {
  const root = area === 'parent' ? PATHS.parent : PATHS.admin;
  return {
    quizzes: root.quizzes,
    newQuiz: root.newQuiz,
    quiz: (id: string) => root.quiz(id),
    questions: root.questions,
    newQuestion: root.newQuestion,
    question: (id: string) => root.question(id),
  };
}

/** Anything other than `parent` is the admin area. */
export function readArea(fd: FormData): Area {
  return fd.get('area') === 'parent' ? 'parent' : 'admin';
}
