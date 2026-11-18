import { Users } from 'lucide-react';
import { PageHeader } from '@/core/ui/PageHeader';
import { ViewBar } from '@/core/ui/ViewBar';
import { Button } from '@/themes/neobrutal/ui/button';
import { CreateFamilyDialog } from './components/CreateFamilyDialog';
import { FamiliesTable } from './components/FamiliesTable';
import { listFamilies } from './queries';

const hardShadow = 'shadow-[2px_2px_0_0_var(--color-border)]';

export async function FamiliesView() {
  const families = await listFamilies();
  return (
    <>
      <PageHeader
        icon={Users}
        title="Gia đình"
        actions={
          <CreateFamilyDialog>
            <Button type="button" size="sm" className={`h-7 border-2 ${hardShadow}`}>
              + Tạo
            </Button>
          </CreateFamilyDialog>
        }
      />
      <ViewBar label="gia đình" count={families.length} />
      <FamiliesTable families={families} />
    </>
  );
}
