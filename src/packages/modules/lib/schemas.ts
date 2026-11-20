import { z } from 'zod';

export const moduleToggleInput = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]{1,40}$/),
  enabled: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export type ModuleToggleInput = z.infer<typeof moduleToggleInput>;
