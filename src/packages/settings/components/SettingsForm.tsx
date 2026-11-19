'use client';

import { useActionToast } from '@/core/ui/useActionToast';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { saveSettings } from '../actions';
import type { AppSettings } from '../lib/schemas';

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const [, formAction, pending] = useActionToast(saveSettings, 'Đã lưu cài đặt');
  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="siteName">Tên hiển thị</Label>
        <Input
          id="siteName"
          name="siteName"
          defaultValue={settings.siteName}
          maxLength={40}
          required
          className="h-9"
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="allowRetry"
          defaultChecked={settings.allowRetry}
          className="mt-0.5 size-4"
        />
        <span>
          Cho bé làm lại câu sai một lần
          <span className="block text-xs text-foreground/60">
            Tắt thì bé xem đáp án ngay sau khi nộp. Áp dụng cho cả bài đang làm dở.
          </span>
        </span>
      </label>
      <div>
        <Button type="submit" disabled={pending}>
          Lưu
        </Button>
      </div>
    </form>
  );
}
