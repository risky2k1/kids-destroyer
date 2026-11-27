import { redirect } from 'next/navigation';
import { LETTER_PATH } from '@/plugins/love-letter/letter';

export default function Page() {
  redirect(LETTER_PATH);
}
