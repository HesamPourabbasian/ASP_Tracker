import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سامانه پیگیری محصولات ASP',
  description: 'سیستم ثبت و پیگیری محصولات معیوب و اصلاح شده',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
