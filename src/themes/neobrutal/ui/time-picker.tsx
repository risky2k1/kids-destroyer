'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/themes/neobrutal/lib/utils';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const QUICK_MINUTES = ['00', '15', '30', '45'];

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  'aria-label'?: string;
  disabled?: boolean;
  className?: string;
};

function splitTime(value: string): [string, string] {
  const m = /^(\d{2}):(\d{2})$/.exec(value);
  return m ? [m[1], m[2]] : ['08', '00'];
}

export function TimePicker({
  value,
  onChange,
  name,
  'aria-label': ariaLabel,
  disabled,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [hour, minute] = splitTime(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {name && <input type="hidden" name={name} value={value} />}
      <PopoverTrigger
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          'flex h-9 w-28 items-center justify-between gap-2 rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-base text-foreground hover:bg-foreground/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
      >
        <span>{value || '--:--'}</span>
        <Clock className="size-4 shrink-0 text-foreground/60" />
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-1 border-b-2 border-border/15 pb-2">
            {QUICK_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => onChange(`${hour}:${m}`)}
                className={cn(
                  'flex-1 rounded-base border-2 px-1.5 py-1 text-xs font-heading',
                  minute === m
                    ? 'border-border bg-main text-main-foreground'
                    : 'border-border/20 bg-secondary-background hover:border-border',
                )}
              >
                :{m}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-center text-xs font-heading text-foreground/60">Giờ</span>
              <div className="flex h-44 flex-col gap-0.5 overflow-y-auto rounded-base border-2 border-border/20 bg-secondary-background p-1">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onChange(`${h}:${minute}`)}
                    className={cn(
                      'rounded-base px-2 py-1 text-center text-sm',
                      h === hour
                        ? 'border-2 border-border bg-main font-heading text-main-foreground'
                        : 'hover:bg-foreground/5',
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-center text-xs font-heading text-foreground/60">Phút</span>
              <div className="flex h-44 flex-col gap-0.5 overflow-y-auto rounded-base border-2 border-border/20 bg-secondary-background p-1">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onChange(`${hour}:${m}`)}
                    className={cn(
                      'rounded-base px-2 py-1 text-center text-sm',
                      m === minute
                        ? 'border-2 border-border bg-main font-heading text-main-foreground'
                        : 'hover:bg-foreground/5',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button type="button" size="xs" onClick={() => setOpen(false)} className="w-full">
            Xong ({hour}:{minute})
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
