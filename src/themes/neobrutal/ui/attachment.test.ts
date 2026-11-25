import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from './attachment';

describe('Attachment primitives', () => {
  it('renders slots, status data attribute, and truncating content wrapper', () => {
    const html = renderToStaticMarkup(
      createElement(
        AttachmentGroup,
        { layout: 'grid' },
        createElement(
          Attachment,
          { variant: 'card', status: 'error' },
          createElement(
            AttachmentMedia,
            { variant: 'image' },
            createElement('img', { src: '/a.png', alt: '' }),
          ),
          createElement(
            AttachmentContent,
            null,
            createElement(AttachmentTitle, null, 'very-long-filename-without-spaces.webp'),
            createElement(AttachmentDescription, null, 'Lỗi tải tệp'),
          ),
          createElement(
            AttachmentActions,
            null,
            createElement(AttachmentAction, { 'aria-label': 'Xóa tệp' }, 'X'),
          ),
        ),
      ),
    );

    expect(html).toContain('data-slot="attachment-group"');
    expect(html).toContain('data-slot="attachment"');
    expect(html).toContain('data-status="error"');
    expect(html).toContain('data-variant="card"');
    expect(html).toContain('data-slot="attachment-media"');
    expect(html).toContain('data-slot="attachment-content"');
    expect(html).toContain('min-w-0');
    expect(html).toContain('truncate');
    expect(html).toContain('type="button"');
  });

  it('renders a fallback icon when image media has no children', () => {
    const html = renderToStaticMarkup(createElement(AttachmentMedia, { variant: 'image' }, null));

    expect(html).toContain('data-slot="attachment-media-fallback"');
    expect(html).toContain('<svg');
  });
});
