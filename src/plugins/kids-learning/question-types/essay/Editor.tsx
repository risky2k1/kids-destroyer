'use client';

import { Input } from '@/themes/neobrutal/ui/input';
import { Label } from '@/themes/neobrutal/ui/label';
import { Textarea } from '@/themes/neobrutal/ui/textarea';
import type { EssayAnswer, EssayContent } from './schema';

export function Editor({
  content,
  answer,
  onChange,
}: {
  content: EssayContent;
  answer: EssayAnswer;
  onChange: (content: EssayContent, answer: EssayAnswer) => void;
}) {
  function setMinWords(val: number) {
    const minWords = isNaN(val) ? 0 : Math.max(0, Math.min(200, val));
    onChange({ ...content, minWords }, answer);
  }

  function setSample(sample: string) {
    onChange(content, { ...answer, sample });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="essay-min-words" className="text-sm font-bold">
          Số từ tối thiểu (0 = không yêu cầu, tối đa 200 từ)
        </Label>
        <Input
          id="essay-min-words"
          type="number"
          min={0}
          max={200}
          value={content.minWords ?? 0}
          className="h-8 max-w-36"
          onChange={(e) => setMinWords(parseInt(e.target.value, 10))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="essay-sample" className="text-sm font-bold">
          Đáp án mẫu / Gợi ý chấm (tùy chọn, tối đa 2000 ký tự)
        </Label>
        <Textarea
          id="essay-sample"
          value={answer.sample ?? ''}
          maxLength={2000}
          placeholder="Nhập bài mẫu hoặc gợi ý chấm cho phụ huynh..."
          className="min-h-28 text-sm"
          onChange={(e) => setSample(e.target.value)}
        />
        <span className="text-xs text-foreground/60">
          {(answer.sample ?? '').length}/2000 ký tự (chỉ hiển thị cho phụ huynh khi xem đáp án)
        </span>
      </div>
    </div>
  );
}
