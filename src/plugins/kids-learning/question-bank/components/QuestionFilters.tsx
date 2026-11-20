'use client';

import { useRouter } from 'next/navigation';
import { PATHS } from '@/core/routes';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';

type Option = { id: string; name: string };

export function QuestionFilters({
  subjects,
  grades,
  types,
  subject,
  grade,
  type,
}: {
  subjects: Option[];
  grades: Option[];
  types: Option[];
  subject: string;
  grade: string;
  type: string;
}) {
  const router = useRouter();

  function push(next: { subject?: string; grade?: string; type?: string }) {
    const params = new URLSearchParams();
    const subjectId = next.subject ?? subject;
    const gradeId = next.grade ?? grade;
    const typeId = next.type ?? type;
    if (subjectId) params.set('subject', subjectId);
    if (gradeId) params.set('grade', gradeId);
    if (typeId) params.set('type', typeId);
    const qs = params.toString();
    router.push(qs ? `${PATHS.admin.questions}?${qs}` : PATHS.admin.questions);
  }

  const selectClass = 'h-7 w-36 py-0';
  return (
    <span className="inline-flex items-center gap-2">
      <NativeSelect
        aria-label="Môn"
        value={subject}
        className={selectClass}
        onChange={(event) => push({ subject: event.target.value })}
      >
        <option value="">Tất cả môn</option>
        {subjects.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Lớp"
        value={grade}
        className={selectClass}
        onChange={(event) => push({ grade: event.target.value })}
      >
        <option value="">Tất cả lớp</option>
        {grades.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
      <NativeSelect
        aria-label="Dạng"
        value={type}
        className={selectClass}
        onChange={(event) => push({ type: event.target.value })}
      >
        <option value="">Tất cả dạng</option>
        {types.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </NativeSelect>
    </span>
  );
}
