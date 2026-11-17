import type { Metadata } from 'next';
import { Lexend } from 'next/font/google';
import { Toaster } from '@/themes/neobrutal/ui/toast';
import './globals.css';

const lexend = Lexend({ variable: '--font-lexend', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Kids Destroyer',
  description: 'Bài tập cho các cháu',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${lexend.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}
