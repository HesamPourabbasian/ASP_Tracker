'use client';

import React, { useState } from 'react';
import { BarChart3, ChevronDown, ChevronUp, Calendar, ArrowUpRight } from 'lucide-react';
import { MonthlyBreakdownItem } from '@/lib/types';
import { toPersianDigits } from '@/lib/date-utils';

interface MonthlyStatsBarProps {
  monthlyBreakdown?: MonthlyBreakdownItem[];
  selectedMonth?: string;
  onSelectMonth?: (monthKey: string) => void;
  activeType?: 'problematic' | 'corrected';
}

export default function MonthlyStatsBar({
  monthlyBreakdown = [],
  selectedMonth = 'all',
  onSelectMonth,
  activeType = 'problematic',
}: MonthlyStatsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!monthlyBreakdown || monthlyBreakdown.length === 0) {
    return null;
  }

  // Calculate highest count for relative bar heights
  const maxCount = Math.max(
    ...monthlyBreakdown.map((m) =>
      activeType === 'problematic' ? m.problematicCount : m.correctedCount
    ),
    1
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Header Toggle */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <BarChart3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
              آمار توزیع ماهانه کالاها
            </span>
            <span className="text-[11px] text-slate-400 font-medium mr-2 hidden sm:inline">
              (تفکیک بر حسب ماه‌های ثبت در تقویم شمسی)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
            {isExpanded ? 'بستن نمودار' : 'مشاهده نمودار و جزئیات'}
          </span>
          <button
            type="button"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="تغییر وضعیت نمایش"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Chart & Cards View */}
      {isExpanded && (
        <div className="p-4 pt-1 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {monthlyBreakdown.map((item) => {
              const count =
                activeType === 'problematic' ? item.problematicCount : item.correctedCount;
              const isSelected = selectedMonth === item.month;
              const percentage = Math.round((count / maxCount) * 100);

              return (
                <div
                  key={item.yearMonthKey}
                  onClick={() => onSelectMonth && onSelectMonth(item.month)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-600 bg-red-50/50 shadow-xs ring-2 ring-red-600/10'
                      : 'border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-slate-700">
                      {item.monthName} {toPersianDigits(item.year)}
                    </span>
                    <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-red-600' : 'text-slate-400'}`} />
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mt-auto">
                    <span className="text-lg font-black text-slate-900 tracking-tight">
                      {toPersianDigits(count)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">کالا</span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-red-600' : 'bg-slate-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
