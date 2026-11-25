'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { ImageOff } from 'lucide-react';

import { cn } from '@/themes/neobrutal/lib/utils';
import { Button } from './button';

const attachmentGroupVariants = cva('flex', {
  variants: {
    layout: {
      list: 'flex-col gap-2',
      grid: 'flex-wrap gap-3',
    },
  },
  defaultVariants: {
    layout: 'list',
  },
});

function AttachmentGroup({
  className,
  layout = 'list',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof attachmentGroupVariants>) {
  return (
    <div
      data-slot="attachment-group"
      data-layout={layout ?? 'list'}
      className={cn(attachmentGroupVariants({ layout }), className)}
      {...props}
    />
  );
}

const attachmentVariants = cva(
  'group/attachment rounded-base border-2 border-border bg-secondary-background text-foreground transition-opacity',
  {
    variants: {
      variant: {
        inline: 'flex items-center gap-3 p-2.5',
        card: 'relative flex w-36 flex-col gap-2 p-2',
      },
      status: {
        idle: '',
        uploading: 'opacity-75',
        error: 'border-red-500 bg-red-500/10',
      },
    },
    defaultVariants: {
      variant: 'inline',
      status: 'idle',
    },
  },
);

function Attachment({
  className,
  variant = 'inline',
  status = 'idle',
  render,
  ...props
}: useRender.ComponentProps<'div'> & VariantProps<typeof attachmentVariants>) {
  const resolvedVariant = variant ?? 'inline';
  const resolvedStatus = status ?? 'idle';

  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          attachmentVariants({ variant: resolvedVariant, status: resolvedStatus }),
          className,
        ),
      },
      props,
    ),
    state: {
      slot: 'attachment',
      variant: resolvedVariant,
      status: resolvedStatus,
    },
  });
}

const attachmentMediaVariants = cva(
  'flex shrink-0 items-center justify-center overflow-hidden rounded-base border-2 border-border',
  {
    variants: {
      variant: {
        icon: 'size-10 bg-background text-foreground [&_svg]:size-5',
        image:
          'size-11 bg-foreground/10 group-data-[variant=card]/attachment:h-24 group-data-[variant=card]/attachment:w-full [&>img]:size-full [&>img]:object-cover',
      },
    },
    defaultVariants: {
      variant: 'icon',
    },
  },
);

function AttachmentMedia({
  className,
  variant = 'icon',
  children,
  onErrorCapture,
  onLoadCapture,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof attachmentMediaVariants>) {
  const resolvedVariant = variant ?? 'icon';
  const mediaRef = React.useRef<HTMLDivElement>(null);
  const [broken, setBroken] = React.useState(false);
  const hasContent = React.Children.toArray(children).length > 0;
  const showFallback = resolvedVariant === 'image' && (!hasContent || broken);

  React.useEffect(() => {
    if (resolvedVariant !== 'image') return;
    const img = mediaRef.current?.querySelector('img');
    if (img && img.complete && img.naturalWidth === 0) {
      const id = requestAnimationFrame(() => setBroken(true));
      return () => cancelAnimationFrame(id);
    }
  }, [resolvedVariant, children]);

  return (
    <div
      ref={mediaRef}
      data-slot="attachment-media"
      data-variant={resolvedVariant}
      data-broken={broken ? 'true' : undefined}
      onErrorCapture={(e) => {
        if (resolvedVariant === 'image') setBroken(true);
        onErrorCapture?.(e);
      }}
      onLoadCapture={(e) => {
        if (resolvedVariant === 'image') setBroken(false);
        onLoadCapture?.(e);
      }}
      className={cn(
        attachmentMediaVariants({ variant: resolvedVariant }),
        showFallback && '[&>img]:hidden',
        className,
      )}
      {...props}
    >
      {children}
      {showFallback && (
        <ImageOff
          data-slot="attachment-media-fallback"
          className="size-5 text-foreground/40"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function AttachmentContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  );
}

function AttachmentTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="attachment-title"
      className={cn('truncate text-sm font-heading', className)}
      {...props}
    />
  );
}

function AttachmentDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="attachment-description"
      className={cn('truncate text-xs text-foreground/60', className)}
      {...props}
    />
  );
}

function AttachmentActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="attachment-actions"
      className={cn('flex shrink-0 items-center gap-1', className)}
      {...props}
    />
  );
}

function AttachmentAction({
  type = 'button',
  variant = 'neutral',
  size = 'icon-xs',
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button data-slot="attachment-action" type={type} variant={variant} size={size} {...props} />
  );
}

export {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
  attachmentMediaVariants,
  attachmentVariants,
};
