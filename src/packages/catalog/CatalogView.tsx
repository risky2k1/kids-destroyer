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

export async function CatalogView() {
  const catalog = await listCatalog();
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NamedList
        title="Môn học"
        items={catalog.subjects}
        save={saveSubject}
        remove={deleteSubject}
      />
      <NamedList title="Lớp" items={catalog.grades} save={saveGrade} remove={deleteGrade} />
      <TopicList catalog={catalog} save={saveTopic} remove={deleteTopic} />
    </div>
  );
}
