export type MediaVisibility = 'public' | 'private';

export type MediaKind = 'image' | 'document';

export type MediaFolder = {
  id: string;
  parentId: string | null;
  name: string;
  visibility: MediaVisibility;
  createdAt: string;
};

export type MediaFileItem = {
  id: string;
  folderId: string | null;
  visibility: MediaVisibility;
  driver: string;
  storageKey: string;
  name: string;
  alt: string | null;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  url: string | null;
};
