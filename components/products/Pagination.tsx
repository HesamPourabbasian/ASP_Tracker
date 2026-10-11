'use client';

import React from 'react';
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';
import { PaginationInfo } from '@/lib/types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { page, pageSize, totalItems, totalPages, hasNextPage, hasPrevPage } = pagination;

  if (totalItems === 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  // Generate page numbers window
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        end = 4;
      }
      if (page >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium mt-4">
      {/* Right side: Items counter */}
      <div className="text-slate-400 flex items-center gap-1.5 order-2 sm:order-1">
        <span>نمایش</span>
        <strong className="text-slate-200 font-bold">{toPersianDigits(startItem)}</strong>
        <span>تا</span>
        <strong className="text-slate-200 font-bold">{toPersianDigits(endItem)}</strong>
        <span>از مجموع</span>
        <strong className="text-red-400 font-black">{toPersianDigits(totalItems)}</strong>
        <span>کالا</span>
      </div>

      {/* Center: Page numbers navigation */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
          title="صفحه نخست"
          aria-label="صفحه نخست"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
          title="صفحه قبل"
          aria-label="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Numeric page buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, index) =>
            typeof p === 'number' ? (
              <button
                key={index}
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-lg font-bold transition-all cursor-pointer ${
                  page === p
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-black shadow-md shadow-red-600/30 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/80'
                }`}
              >
                {toPersianDigits(p)}
              </button>
            ) : (
              <span key={index} className="px-1 text-slate-500 font-bold">
                {p}
              </span>
            )
          )}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
          title="صفحه بعد"
          aria-label="صفحه بعد"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
          title="صفحه آخر"
          aria-label="صفحه آخر"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Left side: Page Size Selector */}
      <div className="flex items-center gap-2 order-3">
        <span className="text-slate-400">تعداد در صفحه:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 font-bold text-slate-200 focus:outline-hidden focus:border-red-500 cursor-pointer text-xs"
        >
          <option value={10} className="bg-slate-900 text-slate-200">۱۰ سطر</option>
          <option value={20} className="bg-slate-900 text-slate-200">۲۰ سطر</option>
          <option value={50} className="bg-slate-900 text-slate-200">۵۰ سطر</option>
          <option value={100} className="bg-slate-900 text-slate-200">۱۰۰ سطر</option>
          <option value={300} className="bg-slate-900 text-slate-200">۳۰۰ سطر</option>
          <option value={600} className="bg-slate-900 text-slate-200">۶۰۰ سطر</option>
        </select>
      </div>
    </div>
  );
}
