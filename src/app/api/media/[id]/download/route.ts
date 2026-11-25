import { NextResponse } from 'next/server';
import { z } from 'zod';
import { can } from '@/core/acl/access';
import { getCurrentUser } from '@/core/auth/session';
import { createClient } from '@/core/supabase/server';
import { createPrivateDownloadUrl } from '@/packages/media/server';

const uuidSchema = z.uuid();

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!uuidSchema.safeParse(id).success) {
    return NextResponse.json({ error: 'Mã tệp không hợp lệ' }, { status: 400 });
  }

  const sb = await createClient();
  const { data } = await sb.from('media_files').select('id, visibility').eq('id', id).maybeSingle();

  if (!data) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập để truy cập tệp này' }, { status: 401 });
    }
    const allowed = can(user, 'media.view') || can(user, 'media.manage');
    if (!allowed) {
      return NextResponse.json({ error: 'Không có quyền truy cập tệp này' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Không tìm thấy tệp' }, { status: 404 });
  }

  if (data.visibility === 'private') {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập để truy cập tệp này' }, { status: 401 });
    }
    if (!can(user, 'media.view') && !can(user, 'media.manage')) {
      return NextResponse.json({ error: 'Không có quyền truy cập tệp này' }, { status: 403 });
    }
  }

  const url = await createPrivateDownloadUrl(id, 600);
  if (!url) {
    return NextResponse.json({ error: 'Không tạo được liên kết tải tệp' }, { status: 404 });
  }

  const res = NextResponse.redirect(url, 302);
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}
