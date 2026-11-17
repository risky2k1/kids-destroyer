import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { FamilyNameForm } from './components/FamilyNameForm';
import { KidForm } from './components/KidForm';
import { ParentForm } from './components/ParentForm';
import { getFamily } from './queries';

export async function FamilyDetailView({ id }: { id: string }) {
  const family = await getFamily(id);
  if (!family) notFound();
  return (
    <div className="flex flex-col gap-4">
      <FamilyNameForm family={family} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Phụ huynh</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {family.parents.length === 0 && <p>Chưa có tài khoản phụ huynh.</p>}
            {family.parents.map((p) => (
              <p key={p.id} className="font-bold">
                👤 {p.display_name}
              </p>
            ))}
            <ParentForm familyId={family.id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Các bé</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {family.kids.map((k) => (
              <KidForm key={k.id} familyId={family.id} grades={family.grades} kid={k} />
            ))}
            <KidForm familyId={family.id} grades={family.grades} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
