'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, PackageCheck, Wallet, ChevronLeft } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';
import { formatWithCommas, getStoredSalaryRate } from '@/lib/salary-utils';

interface StatsBarProps {
  problematicCount: number;
  correctedCount: number;
  activeType?: 'problematic' | 'corrected';
}

export default function StatsBar({
  problematicCount,
  correctedCount,
  activeType,
}: StatsBarProps) {
  const [salaryRate, setSalaryRate] = useState<number>(() => getStoredSalaryRate());

  useEffect(() => {
    const handleRateUpdate = () => setSalaryRate(getStoredSalaryRate());
    window.addEventListener('asp_salary_rate_updated', handleRateUpdate);
    return () => window.removeEventListener('asp_salary_rate_updated', handleRateUpdate);
  }, []);

  const totalCount = problematicCount + correctedCount;
  const totalSalary = correctedCount * salaryRate;

  const handleOpenSalaryModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('open_salary_modal'));
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Problematic */}
      <div
        className={`interactive-card bg-slate-900/80 rounded-2xl p-5 border shadow-xs flex items-center justify-between transition-all ${
          activeType === 'problematic'
            ? 'border-red-500/80 ring-2 ring-red-500/20 bg-slate-900/95 shadow-lg shadow-red-950/20'
            : 'border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 mb-1">کالاهای مشکل‌دار</span>
          <span className="text-2xl font-black text-white flex items-baseline gap-1">
            {toPersianDigits(problematicCount)}
            <span className="text-xs font-medium text-slate-500">مورد</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400 transition-transform group-hover:scale-105 shadow-inner">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Corrected */}
      <div
        className={`interactive-card bg-slate-900/80 rounded-2xl p-5 border shadow-xs flex items-center justify-between transition-all ${
          activeType === 'corrected'
            ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 bg-slate-900/95 shadow-lg shadow-emerald-950/20'
            : 'border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 mb-1">تصحیح شده توسط من</span>
          <span className="text-2xl font-black text-white flex items-baseline gap-1">
            {toPersianDigits(correctedCount)}
            <span className="text-xs font-medium text-slate-500">مورد</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 transition-transform group-hover:scale-105 shadow-inner">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Total */}
      <div className="interactive-card bg-slate-900/80 rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 shadow-xs flex items-center justify-between transition-all">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-400 mb-1">مجموع کل بررسی‌ها</span>
          <span className="text-2xl font-black text-white flex items-baseline gap-1">
            {toPersianDigits(totalCount)}
            <span className="text-xs font-medium text-slate-500">کالا</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 transition-transform group-hover:scale-105">
          <PackageCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: Total Salary & Earnings */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenSalaryModal}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenSalaryModal();
          }
        }}
        className="interactive-card bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-900/90 rounded-2xl p-5 border border-amber-800/50 hover:border-amber-600/80 shadow-xs hover:shadow-lg hover:shadow-amber-950/40 flex items-center justify-between cursor-pointer group ring-1 ring-amber-500/20 transition-all outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
        title="کلیک کنید تا جزئیات کامل حقوق به تفکیک ماه نمایش داده شود"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-amber-300">درآمد دستمزد من</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-500/30 font-extrabold px-1.5 py-0.2 rounded-md">
              {toPersianDigits(formatWithCommas(salaryRate))} ت/ترک
            </span>
          </div>
          <span className="text-2xl font-black text-amber-400 tracking-tight flex items-baseline gap-1">
            {toPersianDigits(formatWithCommas(totalSalary))}
            <span className="text-xs font-bold text-amber-300/80">تومان</span>
          </span>
          <div className="flex items-center gap-1 text-[11px] text-amber-400/80 font-medium mt-0.5 group-hover:text-amber-300 transition-colors">
            <span>مشاهده تفکیک ماهانه</span>
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-xs">
          <Wallet className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
