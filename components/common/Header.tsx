'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertOctagon, CheckCircle2, Wallet } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';
import { formatWithCommas, getStoredSalaryRate } from '@/lib/salary-utils';
import SalaryCalculatorModal from '@/components/salary/SalaryCalculatorModal';
import { MonthlyBreakdownItem } from '@/lib/types';

export default function Header() {
  const pathname = usePathname();
  const [stats, setStats] = useState<{
    problematicCount: number;
    correctedCount: number;
    monthlyBreakdown?: MonthlyBreakdownItem[];
  } | null>(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryRate, setSalaryRate] = useState<number>(() => getStoredSalaryRate());

  const fetchStats = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setStats(json.data);
          }
        }
      } catch (e) {
        console.error('Failed to fetch header stats', e);
      }
    }
    loadStats();

    // Listen for custom events to refresh stats on mutations
    const handleStatsUpdate = () => fetchStats();
    const handleRateUpdate = () => setSalaryRate(getStoredSalaryRate());
    const handleOpenSalary = () => setIsSalaryModalOpen(true);

    window.addEventListener('asp_stats_updated', handleStatsUpdate);
    window.addEventListener('asp_salary_rate_updated', handleRateUpdate);
    window.addEventListener('open_salary_modal', handleOpenSalary);

    return () => {
      isMounted = false;
      window.removeEventListener('asp_stats_updated', handleStatsUpdate);
      window.removeEventListener('asp_salary_rate_updated', handleRateUpdate);
      window.removeEventListener('open_salary_modal', handleOpenSalary);
    };
  }, [fetchStats]);

  const isProblematicActive = pathname === '/' || pathname === '/problematic';
  const isCorrectedActive = pathname === '/corrected';

  return (
    <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 shadow-md shadow-black/20 transition-all duration-200">
      {/* Top CTR Accent Red Line with Glow */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-700 w-full shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link href="/problematic" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/30 group-hover:shadow-red-600/50 group-hover:scale-105 transition-all">
                ASP
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white">
                    ASP <span className="text-red-500 font-black">Tracker</span>
                  </span>
                  <span className="bg-red-950/70 text-red-300 border border-red-800/60 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    CTR Aftermarket
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  سامانه مدیریت و پیگیری کالاهای سایت
                </span>
              </div>
            </Link>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/problematic"
              className={`flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                isProblematicActive
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/25 ring-1 ring-red-500/50 font-black'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
              }`}
            >
              <AlertOctagon className={`w-4 h-4 ${isProblematicActive ? 'text-white' : 'text-red-400'}`} />
              <span>کالاهای مشکل‌دار</span>
              {stats !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isProblematicActive
                      ? 'bg-white/20 text-white font-black'
                      : 'bg-red-950/80 text-red-300 border border-red-800/60'
                  }`}
                >
                  {toPersianDigits(stats.problematicCount)}
                </span>
              )}
            </Link>

            <Link
              href="/corrected"
              className={`flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                isCorrectedActive
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-500/50 font-black'
                  : 'bg-slate-900/70 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${isCorrectedActive ? 'text-white' : 'text-emerald-400'}`} />
              <span>تصحیح شده توسط من</span>
              {stats !== null && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isCorrectedActive
                      ? 'bg-white/20 text-white font-black'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  {toPersianDigits(stats.correctedCount)}
                </span>
              )}
            </Link>

            {/* Salary & Earnings Calculator Trigger */}
            <button
              type="button"
              onClick={() => setIsSalaryModalOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-950/40 to-amber-900/30 hover:from-amber-900/50 hover:to-amber-800/40 text-amber-300 border border-amber-800/60 hover:border-amber-700/80 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md group"
              title={`محاسبه حقوق و دستمزد ماهانه بر مبنای هر ترک ${toPersianDigits(formatWithCommas(salaryRate))} تومان`}
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">محاسبه حقوق</span>
              <span className="sm:hidden">حقوق</span>
              {stats !== null && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-200 border border-amber-500/30">
                  {toPersianDigits(formatWithCommas(stats.correctedCount * salaryRate))} ت
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Salary Calculator Modal */}
      <SalaryCalculatorModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
        monthlyBreakdown={stats?.monthlyBreakdown}
        defaultType={isProblematicActive ? 'problematic' : 'corrected'}
      />
    </header>
  );
}
