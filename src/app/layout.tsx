import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { rootMeta, shareTitle } from '@/packages/seo';
import { getSettings } from '@/packages/settings';
import { Toaster } from '@/themes/neobrutal/ui/toast';
import './globals.css';

const lexend = Lexend({ variable: '--font-lexend', subsets: ['latin', 'vietnamese'] });
const description = 'Bài tập cho các cháu';

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, faviconUrl } = await getSettings();
  return {
    ...rootMeta({ title: shareTitle(siteName), description }),
    icons: { icon: faviconUrl ?? '/icon.png' },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${lexend.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col font-sans">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
