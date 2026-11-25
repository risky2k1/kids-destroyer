'use client';

import { useState } from 'react';
import { Ban, Smile } from 'lucide-react';
import { PLACE_ICONS, TagIcon } from '@/plugins/places/shared';
import { Popover, PopoverContent, PopoverTrigger } from '@/themes/neobrutal/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/themes/neobrutal/ui/tooltip';

type Props = {
  defaultIcon?: string | null;
  defaultEmoji?: string | null;
  value?: string | null;
  onChange?: (icon: string | null) => void;
};

/** Popover grid of built-in Lucide icons (keeps legacy emoji until replaced). */
export function IconPicker({
  defaultIcon = null,
  defaultEmoji = null,
  value: controlled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [internalIcon, setInternalIcon] = useState<string | null>(defaultIcon);
  const [emoji, setEmoji] = useState<string | null>(defaultEmoji);
  const icon = controlled !== undefined ? controlled : internalIcon;

  function pick(next: string | null) {
    if (controlled === undefined) setInternalIcon(next);
    setEmoji(null);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <>
      <input type="hidden" name="icon" value={icon ?? ''} />
      <input type="hidden" name="emoji" value={icon ? '' : (emoji ?? '')} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          aria-label="Chọn icon"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-base border-2 border-border bg-secondary-background text-foreground shadow-shadow transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
        >
          {icon || emoji ? (
            <TagIcon tag={{ icon, emoji }} className="size-4" />
          ) : (
            <Smile className="size-4 text-foreground/50" />
          )}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <TooltipProvider delay={150}>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-heading uppercase text-foreground/60">
                Chọn icon loại quán
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                <Tooltip>
                  <TooltipTrigger
                    type="button"
                    onClick={() => pick(null)}
                    aria-label="Không dùng icon"
                    className={`flex h-10 items-center justify-center rounded-base border-2 ${
                      !icon && !emoji
                        ? 'border-border bg-main text-main-foreground'
                        : 'border-border/25 hover:border-border hover:bg-foreground/5'
                    }`}
                  >
                    <Ban className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>Bỏ icon</TooltipContent>
                </Tooltip>
                {PLACE_ICONS.map(({ key, label, Icon }) => (
                  <Tooltip key={key}>
                    <TooltipTrigger
                      type="button"
                      onClick={() => pick(key)}
                      aria-label={label}
                      className={`flex h-10 items-center justify-center rounded-base border-2 ${
                        icon === key
                          ? 'border-border bg-main text-main-foreground'
                          : 'border-border/25 hover:border-border hover:bg-foreground/5'
                      }`}
                    >
                      <Icon className="size-4" />
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </TooltipProvider>
        </PopoverContent>
      </Popover>
    </>
  );
}
