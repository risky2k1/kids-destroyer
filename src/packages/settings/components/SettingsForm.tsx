'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useActionToast } from '@/core/ui/useActionToast';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from '@/themes/neobrutal/ui/attachment';
import { Button } from '@/themes/neobrutal/ui/button';
import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { saveSettings } from '../actions';
import type { AppSettings } from '../lib/schemas';

function BrandingAttachment({
  kind,
  label,
  url,
}: {
  kind: 'logo' | 'favicon';
  label: string;
  url: string;
}) {
  const [removed, setRemoved] = useState(false);

  return (
    <>
      <input type="hidden" name={`remove-${kind}`} value={removed ? 'on' : ''} />
      <Attachment variant="inline" status={removed ? 'error' : 'idle'}>
        <AttachmentMedia variant="image">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote storage URL */}
          <img src={url} alt={label} />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>{label} hiện tại</AttachmentTitle>
          <AttachmentDescription>
            {removed ? 'Sẽ xoá khi bấm Lưu' : 'Đang sử dụng'}
          </AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          {removed ? (
            <AttachmentAction size="xs" onClick={() => setRemoved(false)}>
              Hoàn tác
            </AttachmentAction>
          ) : (
            <AttachmentAction aria-label={`Xoá ${label}`} onClick={() => setRemoved(true)}>
              <X />
            </AttachmentAction>
          )}
        </AttachmentActions>
      </Attachment>
    </>
  );
}

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
          <BrandingAttachment
            key={settings.logoUrl}
            kind="logo"
            label="Logo"
            url={settings.logoUrl}
          />
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
          <BrandingAttachment
            key={settings.faviconUrl}
            kind="favicon"
            label="Favicon"
            url={settings.faviconUrl}
          />
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
