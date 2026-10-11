'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Sparkles, Filter, Wallet } from 'lucide-react';
import { PERSIAN_MONTH_DETAILS, toPersianDigits, getCurrentJalaliMonth, getCurrentJalaliYear } from '@/lib/date-utils';
import { IranianMonthOption } from '@/lib/types';
import { formatWithCommas, getStoredSalaryRate } from '@/lib/salary-utils';

interface IranianMonthTabsProps {
  selectedMonth: string; // 'all' or '01'-'12'
  onSelectMonth: (month: string) => void;
  selectedYear: string;  // 'all' or '1403', etc.
  onSelectYear: (year: string) => void;
  availableMonths?: IranianMonthOption[];
  availableYears?: string[];
  totalAllCount?: number;
}

export default function IranianMonthTabs({
  selectedMonth,
  onSelectMonth,
  selectedYear,
  onSelectYear,
  availableMonths = [],
  availableYears = ['1403', '1402', '1404', '1405'],
  totalAllCount,
}: IranianMonthTabsProps) {
  const currentMonthKey = getCurrentJalaliMonth();
  const currentYear = getCurrentJalaliYear();
  const [salaryRate, setSalaryRate] = useState<number>(() => getStoredSalaryRate());

  useEffect(() => {
    const handleRateUpdate = () => setSalaryRate(getStoredSalaryRate());
    window.addEventListener('asp_salary_rate_updated', handleRateUpdate);
    return () => window.removeEventListener('asp_salary_rate_updated', handleRateUpdate);
  }, []);

  // Create a map of monthNumber -> count
  const countByMonth = new Map<string, number>();
  for (const m of availableMonths) {
    if (selectedYear === 'all' || !m.year || m.year === selectedYear) {
      const key = String(m.monthNumber).padStart(2, '0');
      countByMonth.set(key, (countByMonth.get(key) || 0) + (m.count || 0));
    }
  }

  const handleJumpToCurrentMonth = () => {
    onSelectYear(currentYear);
    onSelectMonth(currentMonthKey);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-xs p-3.5 sm:p-4 mb-6 space-y-3.5">
      {/* Top Header of the Month Divider */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-950/60 text-red-400 flex items-center justify-center border border-red-800/60 shadow-inner">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-white tracking-tight">
              تفکیک ماهانه کالاها (تقویم هجری خورشیدی)
            </h2>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              مشاهده و فیلتر دقیق کالاها و ردیابی‌ها بر اساس ماه‌های سال شمسی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">سال شمسی:</span>
            <select
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 font-bold text-slate-200 text-xs focus:outline-hidden focus:border-red-500 cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-200">همه سال‌ها</option>
              {availableYears.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-slate-200">
                  {toPersianDigits(y)}
                </option>
              ))}
            </select>
          </div>

          {/* Jump to Current Month Button */}
          <button
            type="button"
            onClick={handleJumpToCurrentMonth}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/70 text-red-300 text-[11px] font-bold transition-colors cursor-pointer border border-red-800/60 shadow-xs"
            title="رفتن به ماه جاری"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>ماه جاری ({toPersianDigits(currentYear)})</span>
          </button>

          {/* Salary Calculation Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('open_salary_modal'));
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 text-[11px] font-bold transition-colors cursor-pointer border border-amber-800/60 shadow-xs"
            title="محاسبه حقوق و دستمزد ماهانه بر مبنای هر ترک ۴۵,۰۰۰ تومان"
          >
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">محاسبه حقوق</span>
          </button>
        </div>
      </div>

      {/* Horizontal Month Chips Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {/* All Months Chip */}
        <button
          type="button"
          onClick={() => onSelectMonth('all')}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedMonth === 'all'
              ? 'bg-slate-100 text-slate-950 font-black shadow-md scale-102'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/70'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>همه ماه‌ها</span>
          {typeof totalAllCount === 'number' && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                selectedMonth === 'all' ? 'bg-slate-900 text-white font-black' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {toPersianDigits(totalAllCount)}
            </span>
          )}
        </button>

        {/* 12 Iranian Month Tabs */}
        {PERSIAN_MONTH_DETAILS.map((month) => {
          const isSelected = selectedMonth === month.key;
          const count = countByMonth.get(month.key) || 0;
          const isCurrent = month.key === currentMonthKey;
          const monthSalary = count * salaryRate;

          return (
            <button
              key={month.key}
              type="button"
              onClick={() => onSelectMonth(month.key)}
              title={
                count > 0
                  ? `${month.name}: ${toPersianDigits(count)} کالا • دستمزد: ${toPersianDigits(formatWithCommas(monthSalary))} تومان`
                  : month.name
              }
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 scale-102 ring-2 ring-red-500/40 font-black'
                  : count > 0
                  ? 'bg-slate-800/90 text-slate-200 hover:bg-slate-750 hover:text-white border border-slate-700/90'
                  : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 border border-slate-800/80'
              }`}
            >
              <span>{month.name}</span>

              {/* Count badge */}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white font-black'
                      : 'bg-red-950/80 text-red-300 border border-red-800/60 font-black'
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              )}

              {/* Current Month dot indicator */}
              {isCurrent && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-red-400 animate-ping'
                  }`}
                  title="ماه جاری شمسی"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
