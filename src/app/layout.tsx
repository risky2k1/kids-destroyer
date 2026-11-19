import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { getSettings } from '@/packages/settings';
import { Toaster } from '@/themes/neobrutal/ui/toast';
import './globals.css';

const lexend = Lexend({ variable: '--font-lexend', subsets: ['latin', 'vietnamese'] });

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSettings();
  return { title: siteName, description: 'Bài tập cho các cháu' };
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
