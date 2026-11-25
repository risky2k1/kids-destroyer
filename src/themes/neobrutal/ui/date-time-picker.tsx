'use client';

import { useEffect, useRef, useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { cn } from '@/themes/neobrutal/lib/utils';
import { Button } from './button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const pad2 = (n: number) => String(n).padStart(2, '0');

function splitDateTime(value: string): { date: string; hour: string; minute: string } | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return { date: m[1], hour: m[2], minute: m[3] };
}

function formatDisplay(value: string): string {
  const parts = splitDateTime(value);
  if (!parts) return '';
  const [y, m, d] = parts.date.split('-');
  return `${d}/${m}/${y} · ${parts.hour}:${parts.minute}`;
}

function localNowString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

type Props = {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
};

export function DateTimePicker({
  id,
  name,
  value: controlled,
  defaultValue = '',
  onChange,
  placeholder = 'Chọn ngày & giờ…',
  clearable,
  required,
  className,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const value = controlled !== undefined ? controlled : internal;
  const parts = splitDateTime(value);
  const canClear = clearable ?? !required;

  useEffect(() => {
    const form = hiddenRef.current?.form;
    if (!form || controlled !== undefined) return;
    const onReset = () => setInternal(defaultValue);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [controlled, defaultValue]);

  function set(next: string) {
    if (controlled === undefined) setInternal(next);
    onChange?.(next);
  }

  function pickDate(dateStr: string) {
    if (parts) {
      set(`${dateStr}T${parts.hour}:${parts.minute}`);
    } else {
      const now = new Date();
      set(`${dateStr}T${pad2(now.getHours())}:${pad2(now.getMinutes())}`);
    }
  }

  function pickTime(hour: string, minute: string) {
    if (parts) {
      set(`${parts.date}T${hour}:${minute}`);
    } else {
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
      set(`${dateStr}T${hour}:${minute}`);
    }
  }

  const activeHour = parts?.hour ?? '12';
  const activeMinute = parts?.minute ?? '00';

  return (
    <div className={cn('relative flex items-center', className)}>
      <input ref={hiddenRef} type="hidden" name={name} value={value} required={required} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          id={id}
          className={cn(
            'flex h-10 w-full items-center justify-between gap-2 rounded-base border-2 border-border bg-secondary-background px-3 text-left text-sm font-base text-foreground hover:bg-foreground/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
            canClear && value ? 'pr-9' : '',
            triggerClassName,
          )}
        >
          <span className={cn('truncate', !value && 'text-foreground/50')}>
            {value ? formatDisplay(value) : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-foreground/60" />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Calendar selected={parts?.date ?? null} onSelect={pickDate} />

            <div className="flex flex-col gap-2 border-t-2 border-border/15 pt-3 sm:border-t-0 sm:border-l-2 sm:pt-0 sm:pl-3">
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex flex-col gap-1">
                  <span className="text-center text-xs font-heading text-foreground/60">Giờ</span>
                  <div className="flex h-48 w-14 flex-col gap-0.5 overflow-y-auto rounded-base border-2 border-border/20 bg-secondary-background p-1">
                    {HOURS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => pickTime(h, activeMinute)}
                        className={cn(
                          'rounded-base py-1 text-center text-xs',
                          h === activeHour
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
                  <div className="flex h-48 w-14 flex-col gap-0.5 overflow-y-auto rounded-base border-2 border-border/20 bg-secondary-background p-1">
                    {MINUTES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => pickTime(activeHour, m)}
                        className={cn(
                          'rounded-base py-1 text-center text-xs',
                          m === activeMinute
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

              <div className="flex gap-1.5">
                <Button
                  type="button"
                  size="xs"
                  variant="neutral"
                  className="flex-1"
                  onClick={() => set(localNowString())}
                >
                  Bây giờ
                </Button>
                <Button type="button" size="xs" className="flex-1" onClick={() => setOpen(false)}>
                  Xong
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {canClear && value && (
        <button
          type="button"
          aria-label="Xóa ngày giờ"
          onClick={(e) => {
            e.stopPropagation();
            set('');
          }}
          className="absolute right-8 inline-flex size-6 items-center justify-center rounded-base text-foreground/50 hover:bg-foreground/10 hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
