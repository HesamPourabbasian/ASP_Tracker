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
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased flex flex-col font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
        {/* Ambient atmospheric dark glow */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-40 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-10 w-80 h-80 bg-red-950/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-10 w-96 h-96 bg-slate-800/20 rounded-full blur-3xl" />
        </div>

        <ToastProvider>
          <div className="no-print">
            <Header />
          </div>
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="no-print border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md py-4 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">ASP Tracker &copy; {new Date().getFullYear()}</span>
              <span>سامانه تخصصی مدیریت محصولات و خطاهای کاتالوگ CTR</span>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
