import type { Metadata } from 'next';

// shortcut: one public host, move to an env var if a second origin is shared
export const SITE_ORIGIN = 'https://www.phmtuns.io.vn';

/** Crawlers are anonymous, and settings are authenticated-only, so they only ever see this name. */
export const PUBLIC_NAME = 'phmtuns';
const TEMPLATE_SITE_NAME = 'T-CMS';

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 160;
export const SHARE_IMAGE = { width: 1200, height: 630 };

export function shareTitle(siteName: string): string {
  const name = siteName.trim();
  return name && name !== TEMPLATE_SITE_NAME ? name : PUBLIC_NAME;
}

export function shareCopy(title: string, description: string) {
  const clean = (value: string, max: number) => value.replace(/\s+/g, ' ').trim().slice(0, max);
  return {
    title: clean(title, TITLE_MAX) || PUBLIC_NAME,
    description: clean(description, DESCRIPTION_MAX),
  };
}

export function shareImagePath(title: string, description: string): string {
  const copy = shareCopy(title, description);
  const query = new URLSearchParams({ title: copy.title, description: copy.description });
  return `/og?${query}`;
}

type ShareInput = {
  title: string;
  description: string;
  path?: string;
  /** Omit to leave the site indexable. */
  index?: boolean;
};

/** Full share tags for one page. Replaces parent openGraph, so the image is included here. */
export function shareMeta({ title, description, path, index }: ShareInput): Metadata {
  const copy = shareCopy(title, description);
  const image = shareImagePath(copy.title, copy.description);
  return {
    title: copy.title,
    description: copy.description,
    ...(index === undefined ? {} : { robots: { index, follow: index } }),
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: path,
      type: 'website',
      locale: 'vi_VN',
      images: [{ url: image, ...SHARE_IMAGE, alt: copy.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [image],
    },
  };
}

export function rootMeta(input: { title: string; description: string }): Metadata {
  return {
    metadataBase: new URL(SITE_ORIGIN),
    ...shareMeta({ ...input, path: '/' }),
  };
}
