export const PATHS = {
  login: '/login',
  admin: {
    root: '/admin',
    catalog: '/admin/catalog',
    families: '/admin/families',
    family: (id: string) => `/admin/families/${id}`,
  },
  parent: { root: '/parent', kidMode: '/parent/kid-mode' },
  kid: { root: '/kid', exit: '/kid/exit', reset: '/kid/reset' },
} as const;
