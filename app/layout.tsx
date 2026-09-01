import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/ToastContext';
import Header from '@/components/common/Header';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'ASP Tracker | سامانه پیگیری کالاهای مشکل‌دار و اصلاح‌شده',
  description: 'سیستم پیشرفته مدیریت و ردیابی کالاهای دارای مشکل و کدهای اصلاح‌شده وبسایت',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col font-sans selection:bg-red-600 selection:text-white">
        <ToastProvider>
          <div className="no-print">
            <Header />
          </div>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="no-print border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-semibold text-slate-700">ASP Tracker &copy; {new Date().getFullYear()}</span>
              <span>سامانه تخصصی مدیریت محصولات و خطاهای کاتالوگ</span>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
