import { shareMeta } from '@/packages/seo';
import { LetterView } from '@/plugins/love-letter/letter';

export const metadata = shareMeta({
  title: 'For You',
  description: 'A letter, just for you.',
  path: '/for-you',
  index: false,
});

export default function Page() {
  return <LetterView />;
}
