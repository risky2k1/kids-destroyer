import { redirect } from 'next/navigation';
import { PATHS } from '@/core/routes';

export default function Home() {
  redirect(PATHS.login);
}
