import { PLACES_PATHS } from './paths';

/** `null` stays on the place being edited. */
export function placeSaveTarget(intent: string | null, id: string, isNew: boolean): string | null {
  if (intent === 'index') return PLACES_PATHS.admin;
  if (intent === 'new') return PLACES_PATHS.new;
  return isNew ? PLACES_PATHS.edit(id) : null;
}
