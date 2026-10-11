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
        className={`interactive-card bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between ${
          activeType === 'problematic'
            ? 'border-red-500/80 ring-2 ring-red-500/10'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">کالاهای مشکل‌دار</span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
            {toPersianDigits(problematicCount)}
            <span className="text-xs font-medium text-slate-400">مورد</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 transition-transform group-hover:scale-105">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Corrected */}
      <div
        className={`interactive-card bg-white rounded-2xl p-5 border shadow-xs flex items-center justify-between ${
          activeType === 'corrected'
            ? 'border-red-500/80 ring-2 ring-red-500/10'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">تصحیح شده توسط من</span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
            {toPersianDigits(correctedCount)}
            <span className="text-xs font-medium text-slate-400">مورد</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-105">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Total */}
      <div className="interactive-card bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">مجموع کل بررسی‌ها</span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
            {toPersianDigits(totalCount)}
            <span className="text-xs font-medium text-slate-400">کالا</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-transform group-hover:scale-105">
          <PackageCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Card 4: Total Salary & Earnings */}
      <div
        onClick={handleOpenSalaryModal}
        className="interactive-card bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 rounded-2xl p-5 border border-amber-200 hover:border-amber-300 shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer group ring-1 ring-amber-400/20"
        title="کلیک کنید تا جزئیات کامل حقوق به تفکیک ماه نمایش داده شود"
      >
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-bold text-amber-900">درآمد دستمزد من</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded-md">
              {toPersianDigits(formatWithCommas(salaryRate))} ت/ترک
            </span>
          </div>
          <span className="text-2xl font-black text-amber-700 tracking-tight flex items-baseline gap-1">
            {toPersianDigits(formatWithCommas(totalSalary))}
            <span className="text-xs font-bold text-amber-800">تومان</span>
          </span>
          <div className="flex items-center gap-1 text-[11px] text-amber-800/80 font-medium mt-0.5 group-hover:text-amber-900">
            <span>مشاهده تفکیک ماهانه</span>
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform shadow-xs">
          <Wallet className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
