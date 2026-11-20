'use client';

import { useEffect, useState } from 'react';
import type { GradeResult } from '@/plugins/kids-learning/question-types';
import { voiceUrl } from './actions';
import type { VoiceAnswer, VoiceContent, VoiceResponse } from './schema';

export function Review({
  answer,
  response,
}: {
  content: VoiceContent;
  answer: VoiceAnswer;
  response: VoiceResponse | undefined;
  result: GradeResult | undefined;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [fetchedPath, setFetchedPath] = useState<string | null>(null);

  useEffect(() => {
    const path = response?.path;
    if (!path) {
      return;
    }
    let cancelled = false;
    voiceUrl(path)
      .then((signedUrl) => {
        if (!cancelled) {
          setUrl(signedUrl);
          setFetchedPath(path);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUrl(null);
          setFetchedPath(path);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [response?.path]);

  const loading = Boolean(response?.path) && fetchedPath !== response?.path;

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1.5">
        <span className="font-bold">Bản ghi âm của bé:</span>
        {!response?.path ? (
          <div className="rounded-base border-2 border-border bg-secondary-background p-3 text-base italic text-foreground/60">
            Bé chưa thu âm
          </div>
        ) : loading ? (
          <div className="p-2 text-foreground/60">Đang tải bản ghi âm...</div>
        ) : url ? (
          <audio controls src={url} className="w-full max-w-md">
            Trình duyệt không hỗ trợ phát âm thanh.
          </audio>
        ) : (
          <div className="rounded-base border-2 border-border bg-secondary-background p-3 text-base text-destructive">
            Không thể tải bản ghi âm
          </div>
        )}
      </div>

      {answer.hint?.trim() ? (
        <div className="flex flex-col gap-1.5">
          <div className="whitespace-pre-wrap rounded-base border-2 border-border bg-secondary-background/60 p-3 text-sm">
            <span className="font-bold text-foreground/80">Gợi ý chấm: </span>
            {answer.hint}
          </div>
        </div>
      ) : null}
    </div>
  );
}
