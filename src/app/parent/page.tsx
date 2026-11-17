import { getCurrentUser } from '@/core/auth/session';

export default async function ParentHome() {
  const user = await getCurrentUser();
  return <h1 className="text-2xl">Xin chào {user?.displayName} 👋</h1>;
}
