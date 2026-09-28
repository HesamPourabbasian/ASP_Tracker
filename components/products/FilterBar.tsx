'use client';

import React from 'react';
import { Search, Filter, RotateCcw, ArrowUpDown, Tag, Link as LinkIcon, X, Calendar } from 'lucide-react';
import { toPersianDigits, PERSIAN_MONTH_DETAILS } from '@/lib/date-utils';
import { IranianMonthOption } from '@/lib/types';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  month?: string;
  onMonthChange?: (value: string) => void;
  hasLink: string;
  onHasLinkChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderToggle: () => void;
  availableBrands: string[];
  availableMonths?: IranianMonthOption[];
  onReset: () => void;
  isFiltered: boolean;
}

export default function FilterBar({
  search,
  onSearchChange,
  brand,
  onBrandChange,
  month = 'all',
  onMonthChange,
  hasLink,
  onHasLinkChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  availableBrands,
  availableMonths = [],
  onReset,
  isFiltered,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3 mb-6">
      {/* Top Search Line */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجوی کالا بر اساس نام، برند، کد سایت، لینک یا توضیحات..."
            className="w-full pr-10 pl-10 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-sm font-medium focus:outline-hidden transition-all bg-slate-50/50 hover:bg-white"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="پاک کردن جستجو"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Order Toggle Button */}
        <button
          type="button"
          onClick={onSortOrderToggle}
          className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition-colors shrink-0"
          title={sortOrder === 'asc' ? 'ترتیب صعودی (۱ به بعد)' : 'ترتیب نزولی (جدیدترین به اول)'}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-red-600" />
          <span>{sortOrder === 'asc' ? 'صعودی (۱ به بالا)' : 'نزولی (جدیدترین)'}</span>
        </button>

        {/* Reset Filters */}
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors border border-red-200 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>حذف فیلترها</span>
          </button>
        )}
      </div>

      {/* Secondary Filters Line */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1 text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5 text-red-600" />
          <span>فیلترهای سریع:</span>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">برند:</span>
          <select
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-red-600 cursor-pointer text-xs"
          >
            <option value="all">همه برندها</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Iranian Month Filter */}
        {onMonthChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">ماه شمسی:</span>
            <select
              value={month}
              onChange={(e) => onMonthChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-red-600 cursor-pointer text-xs"
            >
              <option value="all">همه ماه‌ها</option>
              {PERSIAN_MONTH_DETAILS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Has Link Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">وضعیت لینک:</span>
          <select
            value={hasLink}
            onChange={(e) => onHasLinkChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-red-600 cursor-pointer text-xs"
          >
            <option value="all">همه</option>
            <option value="true">دارای لینک</option>
            <option value="false">بدون لینک</option>
          </select>
        </div>

        {/* Sort By Field */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium">مرتب‌سازی بر اساس:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-red-600 cursor-pointer text-xs"
          >
            <option value="createdAt">زمان ثبت ردیف</option>
            <option value="productName">نام محصول</option>
            <option value="brand">برند</option>
            <option value="date">تاریخ کالا</option>
          </select>
        </div>
      </div>
    </div>
  );
}
