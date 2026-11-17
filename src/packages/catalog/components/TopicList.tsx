'use client';

import { useState } from 'react';
import type { ActionState } from '@/core/actions';
import { ConfirmDelete } from '@/core/ui/ConfirmDelete';
import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { Input } from '@/themes/neobrutal/ui/input';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import type { Catalog } from '../queries';

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

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
    <Card>
      <CardHeader>
        <CardTitle>Chủ đề</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-2">
          <NativeSelect
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            aria-label="Môn"
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
          >
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        {shown.length === 0 && <p className="text-sm">Chưa có chủ đề.</p>}
        {shown.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2">
            <span>{t.name}</span>
            <ConfirmDelete id={t.id} label={t.name} action={remove} />
          </div>
        ))}
        <form action={addAction} className="flex gap-2">
          <input type="hidden" name="subjectId" value={subjectId} />
          <input type="hidden" name="gradeId" value={gradeId} />
          <Input name="name" placeholder="Chủ đề mới" aria-label="Tên chủ đề" required />
          <Button type="submit" size="sm" disabled={pending || !subjectId || !gradeId}>
            Thêm
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
