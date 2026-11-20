import { House } from 'lucide-react';
import { disabledModules } from '@/core/modules/server';
import { PageHeader } from '@/core/ui/PageHeader';
import { DashboardView } from '@/plugins/kids-learning/dashboard';

export default async function AdminHome() {
  const disabled = await disabledModules();
  if (disabled.includes('kids-learning')) {
    return (
      <>
        <PageHeader icon={House} title="Trang chủ" />
        <div className="p-4 text-sm text-foreground/60">Chưa có plugin nào cung cấp trang chủ.</div>
      </>
    );
  }
  return <DashboardView />;
}
