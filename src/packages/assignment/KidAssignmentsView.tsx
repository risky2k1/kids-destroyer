import Link from 'next/link';
import { PATHS } from '@/core/routes';
import { getCurrentKid } from '@/packages/family';
import { Badge } from '@/themes/neobrutal/ui/badge';
import { Button } from '@/themes/neobrutal/ui/button';
import { listKidAssignments } from './kidQueries';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export async function KidAssignmentsView() {
  const [kid, assignments] = await Promise.all([getCurrentKid(), listKidAssignments()]);

  const pending = assignments
    .filter((a) => a.step === 'play1' || a.step === 'play2')
    .sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });

  const completed = assignments.filter((a) => a.step === 'done');
  const now = new Date();

  return (
    <div className="flex flex-col gap-8 py-2">
      <div className="rounded-base border-2 border-border bg-main/15 p-6 shadow-[3px_3px_0_0_var(--color-border)]">
        <h1 className="text-3xl font-black">
          Chào {kid?.displayName} {kid?.avatar}!
        </h1>
        <p className="mt-1 text-lg text-foreground/80">
          Hôm nay chúng ta cùng học và hoàn thành các bài tập nhé!
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Bài cần làm ({pending.length})</h2>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-base border-2 border-dashed border-border bg-background p-6 text-center">
            <p className="text-xl font-bold">
              {assignments.length === 0
                ? 'Chưa có bài nào. Đi chơi đi 🎉'
                : 'Không có bài nào cần làm 🎉'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pending.map((a) => {
              const isOverdue = a.dueAt ? new Date(a.dueAt) < now : false;
              const isRetry = a.step === 'play2';

              return (
                <div
                  key={a.id}
                  className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-5 shadow-[3px_3px_0_0_var(--color-border)] md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-2xl font-bold">{a.quizTitle}</span>
                      {isRetry && (
                        <Badge className="bg-chart-4/30 px-2 py-0.5 text-sm font-bold">
                          Làm lại câu sai
                        </Badge>
                      )}
                      {isOverdue && (
                        <Badge className="border-red-500 bg-red-100 text-sm font-bold text-red-700">
                          Quá hạn
                        </Badge>
                      )}
                    </div>
                    <p className="text-base text-foreground/70">
                      {a.dueAt ? `Hạn nộp: ${formatDate(a.dueAt)}` : 'Không có hạn nộp'}
                    </p>
                  </div>

                  <Button
                    render={<Link href={PATHS.kid.assignment(a.id)} />}
                    nativeButton={false}
                    className="h-16 px-8 text-xl font-bold"
                  >
                    {isRetry ? 'Làm lại câu sai' : 'Làm bài'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Đã xong ({completed.length})</h2>
          <div className="flex flex-col gap-3">
            {completed.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-3 rounded-base border-2 border-border bg-secondary-background p-4 shadow-[2px_2px_0_0_var(--color-border)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xl font-bold">{a.quizTitle}</span>
                  <span className="text-base font-bold text-main-foreground">
                    Điểm: {a.score !== null ? `${a.score}/10` : 'Chờ chấm'}
                  </span>
                </div>
                <Button
                  render={<Link href={PATHS.kid.assignment(a.id)} />}
                  nativeButton={false}
                  variant="neutral"
                  className="min-h-12 px-6 text-lg font-bold"
                >
                  Xem lại
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
