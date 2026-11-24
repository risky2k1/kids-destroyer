import type { Metadata } from 'next';
import { LetterView } from '@/plugins/love-letter/letter';

const title = 'Có thư cho bà nè 💌';
const description = 'Chạm để mở nhé.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description },
};

export default function Page() {
  return <LetterView />;
}
