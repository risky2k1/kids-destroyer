import { requireArea } from '@/core/auth/session';
import { KidPicker } from './components/KidPicker';
import { listKidsForFamily } from './queries';

export async function KidPickerView() {
  const user = await requireArea('kid');
  const kids = await listKidsForFamily(user.familyId!);
  if (kids.length === 0) return <p>Nhà mình chưa có bé nào. Nhờ admin thêm nhé.</p>;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-3xl">Ai làm bài nào? 🎒</h1>
      <KidPicker kids={kids} />
    </div>
  );
}
