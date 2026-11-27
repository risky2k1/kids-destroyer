import { SUPABASE_URL } from '@/core/supabase/env';

export function questionImageUrl(path: string | null): string | null {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/question-images/${path}`;
}
