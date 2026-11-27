import type { Metadata } from 'next';
import { LetterView } from '@/plugins/love-letter/letter';

const title = 'For You 💌';
const description = 'A letter, just for you.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description },
};

export default function Page() {
  return <LetterView />;
}
