'use client';

import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { PERSIAN_MONTH_DETAILS, toPersianDigits, getCurrentJalaliMonth, getCurrentJalaliYear } from '@/lib/date-utils';
import { IranianMonthOption } from '@/lib/types';

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
  availableYears = ['1403', '1402', '1404'],
  totalAllCount,
}: IranianMonthTabsProps) {
  const currentMonthKey = getCurrentJalaliMonth();
  const currentYear = getCurrentJalaliYear();

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 mb-6 space-y-3">
      {/* Top Header of the Month Divider */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-slate-800 tracking-tight">
              تفکیک ماهانه کالاها (تقویم هجری خورشیدی)
            </h2>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              مشاهده و فیلتر دقیق کالاها و ردیابی‌ها بر اساس ماه‌های سال شمسی
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Year Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">سال شمسی:</span>
            <select
              value={selectedYear}
              onChange={(e) => onSelectYear(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-800 text-xs focus:outline-hidden focus:border-red-600 cursor-pointer"
            >
              <option value="all">همه سال‌ها</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {toPersianDigits(y)}
                </option>
              ))}
            </select>
          </div>

          {/* Jump to Current Month Button */}
          <button
            type="button"
            onClick={handleJumpToCurrentMonth}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors cursor-pointer border border-red-200"
            title="رفتن به ماه جاری"
          >
            <Sparkles className="w-3 h-3" />
            <span>ماه جاری ({toPersianDigits(currentYear)})</span>
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
              ? 'bg-slate-900 text-white shadow-xs scale-102'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>همه ماه‌ها</span>
          {typeof totalAllCount === 'number' && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                selectedMonth === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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

          return (
            <button
              key={month.key}
              type="button"
              onClick={() => onSelectMonth(month.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20 scale-102 ring-2 ring-red-600/20'
                  : count > 0
                  ? 'bg-red-50/60 text-slate-800 hover:bg-red-100/70 border border-red-200/50'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{month.name}</span>

              {/* Count badge */}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected
                      ? 'bg-white text-red-600'
                      : 'bg-red-600/10 text-red-700 font-extrabold'
                  }`}
                >
                  {toPersianDigits(count)}
                </span>
              )}

              {/* Current Month dot indicator */}
              {isCurrent && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-white' : 'bg-red-500 animate-ping'
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
