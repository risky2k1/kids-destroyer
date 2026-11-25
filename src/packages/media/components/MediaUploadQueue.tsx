'use client';

import { FileText, RotateCcw, X } from 'lucide-react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from '@/themes/neobrutal/ui/attachment';
import { formatFileSize } from '../lib/files';
import type { UploadQueueItem } from '../lib/uploadClient';

export function MediaUploadQueue({
  items,
  onRetry,
  onDismiss,
}: {
  items: UploadQueueItem[];
  onRetry: (localId: string) => void;
  onDismiss: (localId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <AttachmentGroup layout="list">
      {items.map((item) => {
        const desc =
          item.status === 'error'
            ? (item.error ?? 'Tải tệp thất bại')
            : `${formatFileSize(item.sizeBytes)} · Đang tải ${item.progress}%`;

        return (
          <Attachment key={item.localId} variant="inline" status={item.status}>
            {item.previewUrl ? (
              <AttachmentMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img src={item.previewUrl} alt="" />
              </AttachmentMedia>
            ) : (
              <AttachmentMedia variant="icon">
                <FileText aria-hidden="true" />
              </AttachmentMedia>
            )}
            <AttachmentContent>
              <AttachmentTitle>{item.name}</AttachmentTitle>
              <AttachmentDescription>{desc}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              {item.status === 'error' && (
                <AttachmentAction
                  aria-label={`Thử lại ${item.name}`}
                  onClick={() => onRetry(item.localId)}
                >
                  <RotateCcw aria-hidden="true" />
                </AttachmentAction>
              )}
              <AttachmentAction
                aria-label={`Đóng ${item.name}`}
                onClick={() => onDismiss(item.localId)}
              >
                <X aria-hidden="true" />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        );
      })}
    </AttachmentGroup>
  );
}
