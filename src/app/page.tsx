import { redirect } from 'next/navigation';
import { getCurrentUser, homeFor } from '@/core/auth/session';
import { PATHS } from '@/core/routes';

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? homeFor(user) : PATHS.login);
}
