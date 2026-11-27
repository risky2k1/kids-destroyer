'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/themes/neobrutal/ui/button';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import { generateQuizDraft, type DraftState } from '../actions';
import { DraftEditor } from './DraftEditor';

type Option = { id: string; name: string };
type Topic = Option & { subjectId: string; gradeId: string };
type TypeOption = { id: string; name: string };

const initial: DraftState = { ok: true };

export function DraftRequestForm({
  subjects,
  grades,
  topics,
  types,
  uid,
}: {
  subjects: Option[];
  grades: Option[];
  topics: Topic[];
  types: TypeOption[];
  uid: string;
}) {
  const [state, action, pending] = useActionState(generateQuizDraft, initial);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [gradeId, setGradeId] = useState(grades[0]?.id ?? '');
  const [topicId, setTopicId] = useState('');
  const [count, setCount] = useState(10);
  const [picked, setPicked] = useState<string[]>(types.map((type) => type.id));
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [note, setNote] = useState('');
  const [dismissedKey, setDismissedKey] = useState('');
  const topicChoices = topics.filter(
    (topic) => topic.subjectId === subjectId && topic.gradeId === gradeId,
  );
  const draftKey = state.draft
    ? `${state.left ?? ''}:${state.dropped ?? ''}:${state.draft.title}:${state.draft.items.map((item) => item.prompt).join('|')}`
    : '';
  const showEditor = Boolean(state.draft) && dismissedKey !== draftKey;

  if (showEditor && state.draft) {
    return (
      <DraftEditor
        uid={uid}
        title={state.draft.title}
        items={state.draft.items}
        subjectId={subjectId}
        gradeId={gradeId}
        topicId={topicId}
        lang={lang}
        dropped={state.dropped ?? 0}
        left={state.left ?? 0}
        types={types}
        onBack={() => setDismissedKey(draftKey)}
      />
    );
  }

  return (
    <form action={action} className="flex max-w-xl flex-col gap-3 p-4">
      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-subject">Môn</Label>
        <NativeSelect
          id="ai-subject"
          name="subjectId"
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
        >
          {subjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-grade">Lớp</Label>
        <NativeSelect
          id="ai-grade"
          name="gradeId"
          value={gradeId}
          onChange={(event) => setGradeId(event.target.value)}
        >
          {grades.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-topic">Chủ đề</Label>
        <NativeSelect
          id="ai-topic"
          name="topicId"
          value={topicId}
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
        <Label htmlFor="ai-count">Số câu</Label>
        <input
          id="ai-count"
          name="count"
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
          className="h-8 rounded-base border-2 border-border px-2"
        />
      </div>
      <fieldset className="flex flex-col gap-1">
        <legend className="text-sm font-heading">Dạng câu</legend>
        {types.map((type) => (
          <label key={type.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="types"
              value={type.id}
              checked={picked.includes(type.id)}
              onChange={(event) =>
                setPicked((current) =>
                  event.target.checked
                    ? [...current, type.id]
                    : current.filter((id) => id !== type.id),
                )
              }
            />
            {type.name}
          </label>
        ))}
      </fieldset>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-lang">Ngôn ngữ</Label>
        <NativeSelect
          id="ai-lang"
          name="lang"
          value={lang}
          onChange={(event) => setLang(event.target.value === 'en' ? 'en' : 'vi')}
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">Tiếng Anh</option>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="ai-note">Ghi chú</Label>
        <Textarea
          id="ai-note"
          name="note"
          value={note}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>
      {state.error ? <p className="text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={pending || picked.length === 0}>
        {pending ? 'AI đang soạn…' : 'Tạo đề bằng AI'}
      </Button>
    </form>
  );
}
