import { redirect } from 'next/navigation';
import { BrandMark } from '@/app/_chrome/BrandMark';
import { getCurrentUser, homeFor } from '@/core/auth/session';
import { getSettings } from '@/packages/settings';
import { Card, CardContent, CardHeader, CardTitle } from '@/themes/neobrutal/ui/card';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user));
  const { siteName, logoUrl } = await getSettings();
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <BrandMark logoUrl={logoUrl} siteName={siteName} size={12} />
        <span className="text-xl font-bold">{siteName}</span>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
