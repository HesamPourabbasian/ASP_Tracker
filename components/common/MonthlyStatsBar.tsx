'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, ChevronDown, ChevronUp, ArrowUpRight, Wallet } from 'lucide-react';
import { MonthlyBreakdownItem } from '@/lib/types';
import { toPersianDigits } from '@/lib/date-utils';
import { formatWithCommas, getStoredSalaryRate } from '@/lib/salary-utils';

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
  const [salaryRate, setSalaryRate] = useState<number>(() => getStoredSalaryRate());

  useEffect(() => {
    const handleRateUpdate = () => setSalaryRate(getStoredSalaryRate());
    window.addEventListener('asp_salary_rate_updated', handleRateUpdate);
    return () => window.removeEventListener('asp_salary_rate_updated', handleRateUpdate);
  }, []);

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
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Header Toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors select-none outline-hidden focus-visible:bg-slate-800/50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-800/60 shadow-inner">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-white tracking-tight">
              آمار توزیع ماهانه کالاها
            </span>
            <span className="text-[11px] text-slate-400 font-medium mr-2 hidden sm:inline">
              (تفکیک بر حسب ماه‌های ثبت در تقویم شمسی)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Salary Calculator Modal Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('open_salary_modal'));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-[11px] font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            title="محاسبه حقوق و درآمد ماه‌ها"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>محاسبه درآمد ماه‌ها</span>
          </button>

          <span className="text-[11px] text-slate-400 font-bold hidden sm:inline">
            {isExpanded ? 'بستن نمودار' : 'مشاهده نمودار و جزئیات'}
          </span>
          <div className="p-1 rounded-md text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Chart & Cards View */}
      {isExpanded && (
        <div className="p-4 pt-2 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {monthlyBreakdown.map((item) => {
              const count =
                activeType === 'problematic' ? item.problematicCount : item.correctedCount;
              const isSelected = selectedMonth === item.month;
              const percentage = Math.round((count / maxCount) * 100);
              const monthlySalary = count * salaryRate;

              return (
                <div
                  key={item.yearMonthKey}
                  onClick={() => onSelectMonth && onSelectMonth(item.month)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-500 bg-red-950/40 shadow-lg shadow-red-950/40 ring-2 ring-red-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-bold text-slate-200">
                      {item.monthName} {toPersianDigits(item.year)}
                    </span>
                    <ArrowUpRight className={`w-3 h-3 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                  </div>

                  <div className="flex items-baseline justify-between gap-2 mt-auto">
                    <span className="text-lg font-black text-white tracking-tight">
                      {toPersianDigits(count)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">کالا</span>
                  </div>

                  {/* Monthly Earnings Chip */}
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-medium">حقوق:</span>
                    <span className="font-extrabold text-emerald-400">
                      {toPersianDigits(formatWithCommas(monthlySalary))} ت
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-slate-600'
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
