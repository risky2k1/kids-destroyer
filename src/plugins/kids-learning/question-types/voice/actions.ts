'use server';

import { getCurrentUser } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { getCurrentKid } from '@/plugins/kids-learning/family';
import { VOICE_PATH_REGEX } from './schema';

export async function uploadVoice(
  fd: FormData,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const kid = await getCurrentKid();
  if (!kid) {
    return { ok: false, error: 'Phiên làm bài đã hết' };
  }

  const audio = fd.get('audio');
  if (!(audio instanceof Blob)) {
    return { ok: false, error: 'Không lưu được bản ghi âm' };
  }

  if (audio.size < 1 || audio.size > 2_000_000 || !audio.type.startsWith('audio/')) {
    return { ok: false, error: 'Không lưu được bản ghi âm' };
  }

  const ext = audio.type.includes('mp4') ? 'mp4' : audio.type.includes('ogg') ? 'ogg' : 'webm';
  const path = `${kid.familyId}/${kid.id}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from('voice').upload(path, audio, {
    // Bucket allow-list has bare types; recorders report e.g. 'audio/webm;codecs=opus'.
    contentType: audio.type.split(';')[0],
    upsert: false,
  });

  if (error) {
    return { ok: false, error: 'Không lưu được bản ghi âm' };
  }

  return { ok: true, path };
}

export async function voiceUrl(path: string): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  if (!VOICE_PATH_REGEX.test(path)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from('voice').createSignedUrl(path, 600);
  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}
