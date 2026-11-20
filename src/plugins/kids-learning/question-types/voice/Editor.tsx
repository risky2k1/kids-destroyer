'use client';

import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import type { VoiceAnswer, VoiceContent } from './schema';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: VoiceContent;
  answer: VoiceAnswer;
  onChange: (content: VoiceContent, answer: VoiceAnswer) => void;
}) {
  function setMaxSeconds(val: number) {
    const maxSeconds = isNaN(val) ? 60 : Math.max(10, Math.min(120, val));
    onChange({ ...content, maxSeconds }, answer);
  }

  function setHint(hint: string) {
    onChange(content, { ...answer, hint });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="voice-max-seconds" className="text-sm font-bold">
          Thời gian thu âm tối đa (10..120 giây)
        </Label>
        <Input
          id="voice-max-seconds"
          type="number"
          min={10}
          max={120}
          value={content.maxSeconds ?? 60}
          className="h-8 max-w-36"
          onChange={(e) => setMaxSeconds(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="voice-hint" className="text-sm font-bold">
          Gợi ý chấm cho phụ huynh (tùy chọn, tối đa 500 ký tự)
        </Label>
        <Textarea
          id="voice-hint"
          value={answer.hint ?? ''}
          maxLength={500}
          placeholder="Nhập nội dung mẫu hoặc gợi ý chấm cho phụ huynh..."
          className="min-h-24 text-sm"
          onChange={(e) => setHint(e.target.value)}
        />
        <span className="text-xs text-foreground/60">
          {(answer.hint ?? '').length}/500 ký tự (chỉ hiển thị cho phụ huynh khi xem và chấm)
        </span>
      </div>
    </div>
  );
}
