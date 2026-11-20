'use client';

import { useState } from 'react';
import { Tags } from 'lucide-react';
import type { ActionState } from '@/core/actions';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { RecordTable } from '@/core/ui/RecordTable';
import { useActionToast } from '@/core/ui/useActionToast';
import { ViewBar } from '@/core/ui/ViewBar';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import type { Catalog } from '../queries';

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

const fieldClass =
  'h-7 w-48 border-0 bg-transparent px-1 shadow-none focus-visible:ring-1 focus-visible:ring-offset-0';
const selectClass = 'h-7 w-auto border px-2 py-0 text-[13px] shadow-none';

export function TopicList({
  catalog,
  save,
  remove,
}: {
  catalog: Catalog;
  save: Action;
  remove: Action;
}) {
  const { subjects, grades, topics } = catalog;
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [gradeId, setGradeId] = useState(grades[0]?.id ?? '');
  const [, addAction, pending] = useActionToast(save, 'Đã thêm');
  const shown = topics.filter((t) => t.subject_id === subjectId && t.grade_id === gradeId);

  return (
    <>
      <ViewBar label="chủ đề" count={shown.length}>
        <NativeSelect
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          aria-label="Môn"
          className={selectClass}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          aria-label="Lớp"
          className={selectClass}
        >
          {grades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </NativeSelect>
      </ViewBar>
      <RecordTable
        columns={[
          { key: 'name', label: 'Tên', icon: Tags, render: (topic) => topic.name },
          {
            key: 'actions',
            label: '',
            icon: Tags,
            className: 'w-px',
            render: (topic) => <ConfirmDelete id={topic.id} label={topic.name} action={remove} />,
          },
        ]}
        rows={shown}
        getId={(topic) => topic.id}
        empty="Chưa có chủ đề."
        addRow={
          <form action={addAction} className="flex items-center gap-2">
            <input type="hidden" name="subjectId" value={subjectId} />
            <input type="hidden" name="gradeId" value={gradeId} />
            <Input
              id="new-topics"
              name="name"
              placeholder="Chủ đề mới"
              aria-label="Tên chủ đề"
              className={fieldClass}
              required
            />
            <Button
              type="submit"
              variant="noShadow"
              size="xs"
              className="h-7 border"
              disabled={pending || !subjectId || !gradeId}
            >
              Thêm
            </Button>
          </form>
        }
      />
    </>
  );
}
