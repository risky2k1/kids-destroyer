import Link from 'next/link';
import { House } from 'lucide-react';
import { PATHS } from '@/core/routes';
import { PageHeader } from '@/core/ui/PageHeader';
import { timeAgo } from './lib/stats';
import { getDashboard } from './queries';

const TILE =
  'rounded-base border border-border/10 bg-secondary-background p-3 hover:bg-foreground/[0.03]';

export async function DashboardView() {
  const data = await getDashboard();
  const now = new Date();
  const max = data.byGrade.reduce((highest, row) => Math.max(highest, row.count), 0);
  const tiles = [
    { label: 'Gia đình', value: data.families, href: PATHS.admin.families },
    { label: 'Phụ huynh', value: data.parents, href: PATHS.admin.families },
    { label: 'Các bé', value: data.kids, href: PATHS.admin.families },
    { label: 'Chủ đề', value: data.topics, href: PATHS.admin.topics },
  ];

  return (
    <>
      <PageHeader icon={House} title="Trang chủ" />
      <div className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {tiles.map((tile) => (
            <Link key={tile.label} href={tile.href} className={TILE}>
              <div className="text-2xl font-heading">{tile.value}</div>
              <div className="text-[13px] text-foreground/60">{tile.label}</div>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-base border border-border/10 bg-secondary-background p-3">
            <h2 className="mb-2 text-sm font-heading">Gia đình mới thêm</h2>
            {data.recent.length === 0 ? (
              <p className="text-sm text-foreground/60">Chưa có gia đình nào</p>
            ) : (
              <ul>
                {data.recent.map((family) => (
                  <li key={family.id} className="border-b border-border/10 last:border-0">
                    <Link
                      href={PATHS.admin.family(family.id)}
                      className="flex items-center gap-3 py-2 text-sm"
                    >
                      <span className="mr-auto font-heading">{family.name}</span>
                      <span className="text-foreground/60">{timeAgo(family.created_at, now)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-base border border-border/10 bg-secondary-background p-3">
            <h2 className="mb-2 text-sm font-heading">Bé theo lớp</h2>
            <ul className="flex flex-col gap-2">
              {data.byGrade.map((row) => (
                <li key={row.name} className="flex items-center gap-2 text-sm">
                  <span className="w-24 shrink-0 truncate">{row.name}</span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block h-3 border border-border bg-main"
                      style={{ width: max === 0 ? '0%' : `${(row.count / max) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 shrink-0 text-right tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
