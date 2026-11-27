'use client';

import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { useActionToast } from '@/core/ui/useActionToast';
import { Chips } from '@/core/ui/RecordTable';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { duplicateQuiz, saveQuiz } from '../actions';
import { areaPaths, type Area } from '../lib/area';
import { move } from '../lib/order';
import { ArchiveQuizButton } from './ArchiveQuizButton';

type Option = { id: string; name: string };
type BankQuestion = {
  id: string;
  prompt: string;
  typeName: string;
  subjectId: string;
  gradeId: string;
};
type Item = { questionId: string; prompt: string; typeName: string; points: number };
type Quiz = {
  id: string;
  title: string;
  subjectId: string;
  gradeId: string;
  locked: boolean;
  items: Item[];
};

const field = 'h-8 py-0';
const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export function QuizForm({
  quiz,
  subjects,
  grades,
  questions,
  area = 'admin',
  readOnly = false,
}: {
  quiz: Quiz | null;
  subjects: Option[];
  grades: Option[];
  questions: BankQuestion[];
  area?: Area;
  readOnly?: boolean;
}) {
  const paths = areaPaths(area);
  const locked = quiz?.locked ?? false;
  const disabled = locked || readOnly;
  const [title, setTitle] = useState(quiz?.title ?? '');
  const [subjectId, setSubjectId] = useState(quiz?.subjectId ?? subjects[0]?.id ?? '');
  const [gradeId, setGradeId] = useState(quiz?.gradeId ?? grades[0]?.id ?? '');
  const [items, setItems] = useState<Item[]>(quiz?.items ?? []);
  const [, formAction, pending] = useActionToast(saveQuiz, 'Đã lưu');
  const [, duplicateAction, duplicating] = useActionToast(duplicateQuiz);
  const added = new Set(items.map((item) => item.questionId));
  const bank = questions.filter(
    (question) =>
      question.subjectId === subjectId && question.gradeId === gradeId && !added.has(question.id),
  );

  function changeScope(next: { subjectId?: string; gradeId?: string }) {
    const subject = next.subjectId ?? subjectId;
    const grade = next.gradeId ?? gradeId;
    if (subject === subjectId && grade === gradeId) return;
    if (items.length > 0 && !window.confirm('Đổi môn hoặc lớp sẽ bỏ các câu đang chọn. Tiếp tục?'))
      return;
    setSubjectId(subject);
    setGradeId(grade);
    setItems([]);
  }

  const header = (
    <PageHeader
      icon={ClipboardList}
      title={quiz ? 'Sửa đề' : 'Tạo đề'}
      crumbs={[{ href: paths.quizzes, label: 'Đề' }]}
      actions={
        disabled && quiz ? (
          <form action={duplicateAction}>
            <input type="hidden" name="id" value={quiz.id} />
            <input type="hidden" name="area" value={area} />
            <Button
              type="submit"
              size="sm"
              className={`h-7 border-2 ${hardShadow}`}
              disabled={duplicating}
            >
              Nhân bản để sửa
            </Button>
          </form>
        ) : (
          <Button
            type="submit"
            form="quiz-form"
            size="sm"
            className={`h-7 border-2 ${hardShadow}`}
            disabled={pending}
          >
            Lưu
          </Button>
        )
      }
    />
  );

  if (!quiz && (subjects.length === 0 || grades.length === 0)) {
    return (
      <>
        {header}
        <p className="p-4 text-sm">Hãy tạo môn và lớp trước.</p>
      </>
    );
  }

  return (
    <>
      {header}
      <form id="quiz-form" action={formAction} className="grid gap-6 p-4 md:grid-cols-[20rem_1fr]">
        {quiz ? <input type="hidden" name="id" value={quiz.id} /> : null}
        <input type="hidden" name="area" value={area} />
        <input
          type="hidden"
          name="items"
          value={JSON.stringify(items.map(({ questionId, points }) => ({ questionId, points })))}
        />
        <fieldset disabled={disabled} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          {locked ? <p className="text-sm">Đề đã được giao. Nhân bản để sửa.</p> : null}
          {readOnly && !locked ? <p className="text-sm">Bạn chỉ xem được đề này.</p> : null}
          <div className="flex flex-col gap-1">
            <Label htmlFor="quiz-title">Tên</Label>
            <Input
              id="quiz-title"
              name="title"
              value={title}
              maxLength={100}
              required
              onChange={(event) => setTitle(event.target.value)}
              className="h-8"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="quiz-subject">Môn</Label>
            <NativeSelect
              id="quiz-subject"
              name="subjectId"
              value={subjectId}
              className={field}
              onChange={(event) => changeScope({ subjectId: event.target.value })}
            >
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="quiz-grade">Lớp</Label>
            <NativeSelect
              id="quiz-grade"
              name="gradeId"
              value={gradeId}
              className={field}
              onChange={(event) => changeScope({ gradeId: event.target.value })}
            >
              {grades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          {quiz && !disabled ? <ArchiveQuizButton id={quiz.id} area={area} /> : null}
        </fieldset>
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-heading">Câu trong đề · {items.length}</h2>
            {items.length === 0 ? (
              <p className="text-sm text-foreground/60">Chưa có câu nào.</p>
            ) : null}
            <ul>
              {items.map((item, index) => (
                <li
                  key={item.questionId}
                  className="flex items-center gap-2 border-b border-border/10 py-2"
                >
                  <span className="w-6 text-sm">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm" title={item.prompt}>
                    {item.prompt}
                  </span>
                  <Chips items={[item.typeName]} />
                  <Input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={item.points}
                    aria-label={`Điểm câu ${index + 1}`}
                    disabled={disabled}
                    className="h-8 w-20"
                    onChange={(event) => {
                      const points = Number(event.target.value);
                      if (!Number.isFinite(points)) return;
                      setItems((current) =>
                        current.map((row, i) => (i === index ? { ...row, points } : row)),
                      );
                    }}
                  />
                  <Button
                    type="button"
                    variant="neutral"
                    size="xs"
                    className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                    disabled={disabled || index === 0}
                    onClick={() => setItems((current) => move(current, index, -1))}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="neutral"
                    size="xs"
                    className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                    disabled={disabled || index === items.length - 1}
                    onClick={() => setItems((current) => move(current, index, 1))}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="neutral"
                    size="xs"
                    className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                    disabled={disabled}
                    onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  >
                    Bỏ
                  </Button>
                </li>
              ))}
            </ul>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-heading">Thêm từ ngân hàng</h2>
            {bank.length === 0 ? (
              <p className="text-sm text-foreground/60">Không còn câu nào cùng môn và lớp.</p>
            ) : null}
            <ul>
              {bank.map((question) => (
                <li
                  key={question.id}
                  className="flex items-center gap-2 border-b border-border/10 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-sm" title={question.prompt}>
                    {question.prompt}
                  </span>
                  <Chips items={[question.typeName]} />
                  <Button
                    type="button"
                    variant="neutral"
                    size="xs"
                    className="h-7 border shadow-none hover:translate-x-0 hover:translate-y-0"
                    disabled={disabled}
                    onClick={() =>
                      setItems((current) => [
                        ...current,
                        {
                          questionId: question.id,
                          prompt: question.prompt,
                          typeName: question.typeName,
                          points: 1,
                        },
                      ])
                    }
                  >
                    Thêm
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </form>
    </>
  );
}
