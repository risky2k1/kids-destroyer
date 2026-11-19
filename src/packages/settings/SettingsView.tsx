import { Settings } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { SettingsForm } from './components/SettingsForm';
import { getSettings } from './queries';

export async function SettingsView() {
  const settings = await getSettings();
  return (
    <>
      <PageHeader icon={Settings} title="Cài đặt chung" />
      <div className="p-4">
        <SettingsForm settings={settings} />
      </div>
    </>
  );
}
