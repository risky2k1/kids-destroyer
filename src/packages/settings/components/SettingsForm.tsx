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
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex max-w-lg flex-col gap-4"
    >
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="logo">Logo</Label>
        {settings.logoUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="size-12 rounded-sm border-2 border-border object-cover"
            />
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="remove-logo" className="size-4" />
              <span>Xoá</span>
            </label>
          </div>
        )}
        <Input
          id="logo"
          type="file"
          name="logo"
          accept="image/png,image/jpeg,image/webp"
          className="h-9 cursor-pointer"
        />
        <p className="text-xs text-foreground/60">PNG, JPG, WEBP · tối đa 1 MB</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="favicon">Biểu tượng tab (favicon)</Label>
        {settings.faviconUrl && (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
            <img
              src={settings.faviconUrl}
              alt="Favicon"
              className="size-8 rounded-sm border-2 border-border object-cover"
            />
            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="remove-favicon" className="size-4" />
              <span>Xoá</span>
            </label>
          </div>
        )}
        <Input
          id="favicon"
          type="file"
          name="favicon"
          accept="image/png,image/jpeg,image/webp,image/x-icon,.ico"
          className="h-9 cursor-pointer"
        />
        <p className="text-xs text-foreground/60">PNG, JPG, WEBP · tối đa 1 MB</p>
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
