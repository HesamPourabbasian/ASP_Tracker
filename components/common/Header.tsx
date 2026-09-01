'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertOctagon, CheckCircle2, ShieldAlert, BarChart3, Layers } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

export default function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState<{ problematicCount: number; correctedCount: number } | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch header stats', e);
    }
  };

  useEffect(() => {
    fetchStats();
    // Listen for custom events to refresh stats on mutations
    const handleStatsUpdate = () => fetchStats();
    window.addEventListener('asp_stats_updated', handleStatsUpdate);
    return () => window.removeEventListener('asp_stats_updated', handleStatsUpdate);
  }, []);

  const isProblematicActive = pathname === '/' || pathname === '/problematic';
  const isCorrectedActive = pathname === '/corrected';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top CTR Accent Red Line */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 w-full" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/problematic" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform">
                ASP
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    ASP <span className="text-red-600">Tracker</span>
                  </span>
                  <span className="bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    CTR Aftermarket
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  سامانه مدیریت و پیگیری کالاهای سایت
                </span>
              </div>
            </Link>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/problematic"
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                isProblematicActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 ring-2 ring-red-600/20'
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className={`w-4 h-4 ${isProblematicActive ? 'text-white' : 'text-red-600'}`} />
              <span>کالاهای مشکل‌دار</span>
              {stats !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isProblematicActive
                      ? 'bg-white text-red-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {toPersianDigits(stats.problematicCount)}
                </span>
              )}
            </Link>

            <Link
              href="/corrected"
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                isCorrectedActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 ring-2 ring-red-600/20'
                  : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCorrectedActive ? 'text-white' : 'text-emerald-600'}`} />
              <span>تصحیح شده توسط من</span>
              {stats !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isCorrectedActive
                      ? 'bg-white text-red-700'
                      : 'bg-slate-200 text-slate-800'
                  }`}
                >
                  {toPersianDigits(stats.correctedCount)}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
