'use client';

import React from 'react';

interface StatsBarProps {
  problematicCount: number;
  correctedCount: number;
  totalCount: number;
}

export function StatsBar({ problematicCount, correctedCount, totalCount }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm text-slate-500">مجموع ثبت‌ها</span>
        <div className="text-2xl font-bold">{totalCount}</div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm text-amber-500">دارای ایراد</span>
        <div className="text-2xl font-bold">{problematicCount}</div>
      </div>
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm text-emerald-500">اصلاح شده</span>
        <div className="text-2xl font-bold">{correctedCount}</div>
      </div>
    </div>
  );
}
