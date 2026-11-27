'use client';

import { useState } from 'react';
import { CircleHelp } from 'lucide-react';
import type { Json } from '@/core/supabase/database.types';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { useActionToast } from '@/core/ui/useActionToast';
import { getPlugin } from '@/plugins/kids-learning/question-types';
import { Button } from '@/themes/neobrutal/ui/button';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { duplicateQuestion, saveQuestion } from '../actions';
import { ArchiveQuestionButton } from './ArchiveQuestionButton';

type Option = { id: string; name: string };
type Topic = Option & { subjectId: string; gradeId: string };
type Question = {
  id: string;
  type: string;
  subjectId: string;
  gradeId: string;
  topicId: string | null;
  lang: 'vi' | 'en';
  prompt: string;
  content: Json;
  answer: Json;
  locked: boolean;
};

const field = 'h-8 py-0';
const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

function gradeLabel(score: number) {
  if (score === 1) return 'Đúng';
  if (score === 0) return 'Sai';
  return `Đúng ${Math.round(score * 100)}%`;
}

export function QuestionForm({
  question,
  subjects,
  grades,
  topics,
  types,
  area = 'admin',
}: {
  question: Question | null;
  subjects: Option[];
  grades: Option[];
  topics: Topic[];
  types: Option[];
  area?: 'admin' | 'parent';
}) {
  const locked = question?.locked ?? false;
  const plugin0 = getPlugin(question?.type ?? types[0]?.id ?? '');
  const [type, setType] = useState(question?.type ?? types[0]?.id ?? '');
  const [subjectId, setSubjectId] = useState(question?.subjectId ?? subjects[0]?.id ?? '');
  const [gradeId, setGradeId] = useState(question?.gradeId ?? grades[0]?.id ?? '');
  const [topicId, setTopicId] = useState(question?.topicId ?? '');
  const [lang, setLang] = useState<'vi' | 'en'>(question?.lang ?? 'vi');
  const [prompt, setPrompt] = useState(question?.prompt ?? '');
  const [content, setContent] = useState<unknown>(question?.content ?? plugin0?.emptyContent);
  const [answer, setAnswer] = useState<unknown>(question?.answer ?? plugin0?.emptyAnswer);
  const [response, setResponse] = useState<unknown>();
  const [, formAction, pending] = useActionToast(saveQuestion, 'Đã lưu');
  const [, duplicateAction, duplicating] = useActionToast(duplicateQuestion);
  const plugin = getPlugin(type);
  const root = area === 'parent' ? PATHS.parent : PATHS.admin;
  const topicChoices = topics.filter(
    (item) => item.subjectId === subjectId && item.gradeId === gradeId,
  );

  function pickSubject(id: string) {
    setSubjectId(id);
    setTopicId((current) =>
      topics.some(
        (item) => item.id === current && item.subjectId === id && item.gradeId === gradeId,
      )
        ? current
        : '',
    );
  }

  function pickGrade(id: string) {
    setGradeId(id);
    setTopicId((current) =>
      topics.some(
        (item) => item.id === current && item.subjectId === subjectId && item.gradeId === id,
      )
        ? current
        : '',
    );
  }

  function pickType(id: string) {
    const next = getPlugin(id);
    if (!next) return;
    setType(id);
    setContent(next.emptyContent);
    setAnswer(next.emptyAnswer);
    setResponse(undefined);
  }

  const title = question ? 'Sửa câu' : 'Tạo câu';
  const header = (
    <PageHeader
      icon={CircleHelp}
      title={title}
      crumbs={[{ href: root.questions, label: 'Câu hỏi' }]}
      actions={
        locked && question ? (
          <form action={duplicateAction}>
            <input type="hidden" name="id" value={question.id} />
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
            form="question-form"
            size="sm"
            className={`h-7 border-2 ${hardShadow}`}
            disabled={pending || !plugin}
          >
            Lưu
          </Button>
        )
      }
    />
  );

  if (!question && (types.length === 0 || subjects.length === 0 || grades.length === 0)) {
    return (
      <>
        {header}
        <p className="p-4 text-sm">
          {types.length === 0 ? 'Không có dạng câu nào đang bật.' : 'Hãy tạo môn và lớp trước.'}
        </p>
      </>
    );
  }

  if (!plugin) return header;

  const Editor = plugin.Editor;
  const Player = plugin.Player;
  const contentOk = plugin.contentSchema.safeParse(content);
  const answerOk = plugin.answerSchema.safeParse(answer);
  const responseOk = plugin.responseSchema.safeParse(response);
  const cross =
    contentOk.success && answerOk.success
      ? plugin.validateAnswer?.(contentOk.data, answerOk.data)
      : 'invalid';
  const graded =
    contentOk.success && answerOk.success && responseOk.success && !cross
      ? plugin.grade(contentOk.data, answerOk.data, responseOk.data)
      : null;

  return (
    <>
      {header}
      <form
        id="question-form"
        action={formAction}
        className="grid gap-6 p-4 md:grid-cols-[20rem_1fr]"
      >
        {question ? <input type="hidden" name="id" value={question.id} /> : null}
        <input type="hidden" name="area" value={area} />
        <input type="hidden" name="content" value={JSON.stringify(content ?? {})} />
        <input type="hidden" name="answer" value={JSON.stringify(answer ?? {})} />
        {question ? <input type="hidden" name="type" value={type} /> : null}
        <fieldset disabled={locked} className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
          {locked ? <p className="text-sm">Câu đã được giao. Nhân bản để sửa.</p> : null}
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-type">Dạng</Label>
            <NativeSelect
              id="q-type"
              name={question ? undefined : 'type'}
              value={type}
              className={field}
              disabled={!!question}
              onChange={(event) => pickType(event.target.value)}
            >
              {types.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-subject">Môn</Label>
            <NativeSelect
              id="q-subject"
              name="subjectId"
              value={subjectId}
              className={field}
              onChange={(event) => pickSubject(event.target.value)}
            >
              {subjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-grade">Lớp</Label>
            <NativeSelect
              id="q-grade"
              name="gradeId"
              value={gradeId}
              className={field}
              onChange={(event) => pickGrade(event.target.value)}
            >
              {grades.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-topic">Chủ đề</Label>
            <NativeSelect
              id="q-topic"
              name="topicId"
              value={topicId}
              className={field}
              onChange={(event) => setTopicId(event.target.value)}
            >
              <option value="">Không chọn</option>
              {topicChoices.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-lang">Ngôn ngữ</Label>
            <NativeSelect
              id="q-lang"
              name="lang"
              value={lang}
              className={field}
              onChange={(event) => setLang(event.target.value === 'en' ? 'en' : 'vi')}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">Tiếng Anh</option>
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="q-prompt">Đề bài</Label>
            <Textarea
              id="q-prompt"
              name="prompt"
              value={prompt}
              maxLength={500}
              required
              onChange={(event) => setPrompt(event.target.value)}
            />
          </div>
          {question && !locked ? <ArchiveQuestionButton id={question.id} area={area} /> : null}
        </fieldset>
        <div className="flex min-w-0 flex-col gap-6">
          <fieldset disabled={locked} className="m-0 min-w-0 border-0 p-0">
            <Editor
              content={content}
              answer={answer}
              onChange={(nextContent, nextAnswer) => {
                setContent(nextContent);
                setAnswer(nextAnswer);
              }}
            />
          </fieldset>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-heading">Xem trước</h2>
            <Player content={content} value={response} onChange={setResponse} />
            {graded ? <p className="text-sm font-heading">{gradeLabel(graded.score)}</p> : null}
          </section>
        </div>
      </form>
    </>
  );
}
