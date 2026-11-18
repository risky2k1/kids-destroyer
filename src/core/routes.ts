export const PATHS = {
  login: '/login',
  admin: {
    root: '/admin',
    catalog: '/admin/catalog',
    subjects: '/admin/catalog/subjects',
    grades: '/admin/catalog/grades',
    topics: '/admin/catalog/topics',
    families: '/admin/families',
    family: (id: string) => `/admin/families/${id}`,
  },
  parent: { root: '/parent', kidMode: '/parent/kid-mode' },
  kid: { root: '/kid', exit: '/kid/exit' },
} as const;
