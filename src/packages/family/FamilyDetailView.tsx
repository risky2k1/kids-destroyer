import { notFound } from 'next/navigation';
import { House } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { FamilyNameForm } from './components/FamilyNameForm';
import { KidForm } from './components/KidForm';
import { ParentForm } from './components/ParentForm';
import { getFamily } from './queries';

export async function FamilyDetailView({ id }: { id: string }) {
  const family = await getFamily(id);
  if (!family) notFound();
  return (
    <>
      <PageHeader
        icon={House}
        title={family.name}
        crumbs={[{ href: PATHS.admin.families, label: 'Gia đình' }]}
      />
      <div className="grid gap-6 p-4 md:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-base border border-border/10 bg-main text-sm font-heading">
              {family.name.slice(0, 1)}
            </span>
            <span className="text-sm font-heading">{family.name}</span>
          </div>
          <FamilyNameForm family={family} />
          <p className="text-sm text-foreground/60">Phụ huynh {family.parents.length}</p>
          <p className="text-sm text-foreground/60">Các bé {family.kids.length}</p>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-heading">Phụ huynh · {family.parents.length}</h2>
            <ul>
              {family.parents.map((parent) => (
                <li key={parent.id} className="border-b border-border/10 py-2 text-sm">
                  {parent.display_name}
                </li>
              ))}
            </ul>
            <ParentForm familyId={family.id} />
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-heading">Các bé · {family.kids.length}</h2>
            {family.kids.map((kid) => (
              <div key={kid.id} className="border-b border-border/10 pb-3">
                <KidForm familyId={family.id} grades={family.grades} kid={kid} />
              </div>
            ))}
            <KidForm familyId={family.id} grades={family.grades} />
          </section>
        </div>
      </div>
    </>
  );
}
