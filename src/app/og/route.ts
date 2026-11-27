import { shareCard } from '@/packages/seo/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return shareCard({
    title: searchParams.get('title') ?? '',
    description: searchParams.get('description') ?? '',
  });
}
