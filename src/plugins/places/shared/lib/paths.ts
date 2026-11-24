export const PLACES_PATHS = {
  admin: '/admin/places',
  new: '/admin/places/new',
  edit: (id: string) => `/admin/places/${id}`,
  tags: '/admin/places/tags',
  public: '/di-dau',
} as const;
