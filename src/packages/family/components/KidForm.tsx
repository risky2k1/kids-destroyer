'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { NativeSelect } from '@/themes/neobrutal/ui/native-select';
import { saveKid } from '../actions';
import type { FamilyDetail } from '../queries';
import { AvatarPicker } from './AvatarPicker';

type Kid = FamilyDetail['kids'][number];

export function KidForm({
  familyId,
  grades,
  kid,
}: {
  familyId: string;
  grades: FamilyDetail['grades'];
  kid?: Kid;
}) {
  const [, formAction, pending] = useActionToast(saveKid, kid ? 'Đã lưu' : 'Đã thêm bé');
  const p = kid?.id ?? 'new';
  const locked = kid?.pin_locked_until && new Date(kid.pin_locked_until) > new Date();
  return (
    <form action={formAction} className="border-border flex flex-col gap-3 border-t-2 pt-3">
      {kid && <input type="hidden" name="id" value={kid.id} />}
      <input type="hidden" name="familyId" value={familyId} />
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${p}-name`}>Tên bé</Label>
        <Input id={`${p}-name`} name="displayName" defaultValue={kid?.display_name} required />
      </div>
      <AvatarPicker idPrefix={p} defaultValue={kid?.avatar} />
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${p}-grade`}>Lớp</Label>
          <NativeSelect id={`${p}-grade`} name="gradeId" defaultValue={kid?.grade_id} required>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor={`${p}-pin`}>{kid ? 'PIN mới (bỏ trống = giữ)' : 'PIN 4 số'}</Label>
          <Input
            id={`${p}-pin`}
            name="pin"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            autoComplete="off"
            required={!kid}
            className="w-28"
          />
        </div>
      </div>
      {locked && <p className="text-sm font-bold">🔒 Đang bị khóa PIN. Đặt PIN mới để mở khóa.</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {kid ? 'Lưu' : 'Thêm bé'}
      </Button>
    </form>
  );
}
