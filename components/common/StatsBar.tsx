'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, PackageCheck } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

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
  const totalCount = problematicCount + correctedCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Problematic */}
      <div
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex items-center justify-between ${
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
        <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>

      {/* Card 2: Corrected */}
      <div
        className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex items-center justify-between ${
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
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* Card 3: Total */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all duration-200 shadow-xs flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-500 mb-1">مجموع کل بررسی‌ها</span>
          <span className="text-2xl font-black text-slate-900 flex items-baseline gap-1">
            {toPersianDigits(totalCount)}
            <span className="text-xs font-medium text-slate-400">کالا</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          <PackageCheck className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
