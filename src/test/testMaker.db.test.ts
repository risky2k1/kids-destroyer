import { beforeAll, describe, expect, it } from 'vitest';
import { seedTwoFamilies } from './db';

let s: Awaited<ReturnType<typeof seedTwoFamilies>>;

const png = () =>
  new Blob(
    [
      Uint8Array.from(
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          'base64',
        ),
      ),
    ],
    { type: 'image/png' },
  );

beforeAll(async () => {
  s = await seedTwoFamilies();
});

describe('parent test maker', () => {
  it('origin is set by trigger', async () => {
    const quiz = await s.parentA.client
      .from('quizzes')
      .insert({
        title: 'Đề A',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        origin: 'system',
      })
      .select('origin')
      .single();
    expect(quiz.error).toBeNull();
    expect(quiz.data?.origin).toBe('parent');

    const adminQuiz = await s.admin.client
      .from('quizzes')
      .insert({
        title: 'Đề admin',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        origin: 'parent',
      })
      .select('origin')
      .single();
    expect(adminQuiz.error).toBeNull();
    expect(adminQuiz.data?.origin).toBe('system');

    const question = await s.parentA.client
      .from('questions')
      .insert({
        type: 'mcq',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        prompt: '1+1',
        origin: 'system',
      })
      .select('origin')
      .single();
    expect(question.error).toBeNull();
    expect(question.data?.origin).toBe('parent');

    const adminQuestion = await s.admin.client
      .from('questions')
      .insert({
        type: 'mcq',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        prompt: '2+2',
        origin: 'parent',
      })
      .select('origin')
      .single();
    expect(adminQuestion.error).toBeNull();
    expect(adminQuestion.data?.origin).toBe('system');
  });

  it("parent cannot update another parent's quiz or question", async () => {
    const quiz = await s.parentA.client
      .from('quizzes')
      .insert({ title: 'Đề của A', subject_id: s.subjectId, grade_id: s.gradeId })
      .select('id')
      .single();
    expect(quiz.error).toBeNull();

    const updatedQuiz = await s.parentB.client
      .from('quizzes')
      .update({ title: 'hacked' })
      .eq('id', quiz.data!.id)
      .select();
    expect(updatedQuiz.data ?? []).toEqual([]);

    const question = await s.parentA.client
      .from('questions')
      .insert({
        type: 'mcq',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        prompt: 'câu của A',
      })
      .select('id')
      .single();
    expect(question.error).toBeNull();

    const updatedQuestion = await s.parentB.client
      .from('questions')
      .update({ prompt: 'hacked' })
      .eq('id', question.data!.id)
      .select();
    expect(updatedQuestion.data ?? []).toEqual([]);
  });

  it('quiz_in_use sees other families', async () => {
    const question = await s.parentA.client
      .from('questions')
      .insert({ type: 'number', subject_id: s.subjectId, grade_id: s.gradeId, prompt: '3+3' })
      .select('id')
      .single();
    expect(question.error).toBeNull();

    const quiz = await s.parentA.client
      .from('quizzes')
      .insert({ title: 'Đề bị giao', subject_id: s.subjectId, grade_id: s.gradeId })
      .select('id')
      .single();
    expect(quiz.error).toBeNull();

    const link = await s.parentA.client.from('quiz_questions').insert({
      quiz_id: quiz.data!.id,
      question_id: question.data!.id,
      position: 0,
    });
    expect(link.error).toBeNull();

    const assignment = await s.parentB.client
      .from('assignments')
      .insert({ quiz_id: quiz.data!.id, kid_id: s.kidB });
    expect(assignment.error).toBeNull();

    const locked = await s.parentA.client.rpc('quiz_in_use', { p_quiz_id: quiz.data!.id });
    expect(locked.error).toBeNull();
    expect(locked.data).toBe(true);
  });

  it("question_in_use when inside someone else's quiz", async () => {
    const shared = await s.parentA.client
      .from('questions')
      .insert({
        type: 'fill',
        subject_id: s.subjectId,
        grade_id: s.gradeId,
        prompt: 'câu dùng chung',
      })
      .select('id')
      .single();
    expect(shared.error).toBeNull();

    const quizB = await s.parentB.client
      .from('quizzes')
      .insert({ title: 'Đề của B', subject_id: s.subjectId, grade_id: s.gradeId })
      .select('id')
      .single();
    expect(quizB.error).toBeNull();

    const linkB = await s.parentB.client.from('quiz_questions').insert({
      quiz_id: quizB.data!.id,
      question_id: shared.data!.id,
      position: 0,
    });
    expect(linkB.error).toBeNull();

    const inUse = await s.parentA.client.rpc('question_in_use', { p_question_id: shared.data!.id });
    expect(inUse.error).toBeNull();
    expect(inUse.data).toBe(true);

    const own = await s.parentA.client
      .from('questions')
      .insert({ type: 'fill', subject_id: s.subjectId, grade_id: s.gradeId, prompt: 'câu của A' })
      .select('id')
      .single();
    expect(own.error).toBeNull();

    const quizA = await s.parentA.client
      .from('quizzes')
      .insert({ title: 'Đề chưa giao', subject_id: s.subjectId, grade_id: s.gradeId })
      .select('id')
      .single();
    expect(quizA.error).toBeNull();

    const linkA = await s.parentA.client.from('quiz_questions').insert({
      quiz_id: quizA.data!.id,
      question_id: own.data!.id,
      position: 0,
    });
    expect(linkA.error).toBeNull();

    const free = await s.parentA.client.rpc('question_in_use', { p_question_id: own.data!.id });
    expect(free.error).toBeNull();
    expect(free.data).toBe(false);
  });

  it('image upload limited to own folder', async () => {
    const own = await s.parentA.client.storage
      .from('question-images')
      .upload(`${s.parentA.id}/x.png`, png());
    expect(own.error).toBeNull();

    const other = await s.parentA.client.storage
      .from('question-images')
      .upload(`${s.parentB.id}/x.png`, png());
    expect(other.error).not.toBeNull();
  });

  it('ai_generations is private', async () => {
    const inserted = await s.parentA.client.from('ai_generations').insert({}).select('id');
    expect(inserted.error).toBeNull();

    const other = await s.parentB.client.from('ai_generations').select('id');
    expect(other.error).toBeNull();
    expect(other.data).toEqual([]);

    const own = await s.parentA.client.from('ai_generations').select('id');
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);
  });

  it('parent has quizzes.author', async () => {
    const { data, error } = await s.parentA.client
      .from('role_permissions')
      .select('role_id, permission')
      .eq('role_id', 'parent')
      .eq('permission', 'quizzes.author');
    expect(error).toBeNull();
    expect(data).toEqual([{ role_id: 'parent', permission: 'quizzes.author' }]);
  });
});
