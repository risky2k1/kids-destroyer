import { BookOpen, GraduationCap, Tags, type LucideIcon } from 'lucide-react';
import { FocusButton } from '@/core/ui/FocusButton';
import { PageHeader } from '@/core/ui/PageHeader';
import {
  deleteGrade,
  deleteSubject,
  deleteTopic,
  saveGrade,
  saveSubject,
  saveTopic,
} from './actions';
import { NamedList } from './components/NamedList';
import { TopicList } from './components/TopicList';
import { listCatalog } from './queries';

const META: Record<'subjects' | 'grades' | 'topics', { title: string; icon: LucideIcon }> = {
  subjects: { title: 'Môn học', icon: BookOpen },
  grades: { title: 'Lớp', icon: GraduationCap },
  topics: { title: 'Chủ đề', icon: Tags },
};

export async function CatalogSectionView({
  section,
}: {
  section: 'subjects' | 'grades' | 'topics';
}) {
  const catalog = await listCatalog();
  const meta = META[section];
  return (
    <>
      <PageHeader
        icon={meta.icon}
        title={meta.title}
        actions={<FocusButton targetId={`new-${section}`}>+ Tạo</FocusButton>}
      />
      {section === 'subjects' && (
        <NamedList
          section="subjects"
          title={meta.title}
          items={catalog.subjects}
          save={saveSubject}
          remove={deleteSubject}
        />
      )}
      {section === 'grades' && (
        <NamedList
          section="grades"
          title={meta.title}
          items={catalog.grades}
          save={saveGrade}
          remove={deleteGrade}
        />
      )}
      {section === 'topics' && (
        <TopicList catalog={catalog} save={saveTopic} remove={deleteTopic} />
      )}
    </>
  );
}
