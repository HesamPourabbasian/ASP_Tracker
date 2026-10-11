'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, FileDown } from 'lucide-react';
import { ProductType } from '@/lib/types';
import { toPersianDigits, PERSIAN_MONTH_DETAILS, getCurrentJalaliMonth } from '@/lib/date-utils';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ProductType;
  totalTableItems: number;
  selectedCount: number;
  selectedIds: string[];
}

export default function PdfExportModal({
  isOpen,
  onClose,
  type,
  totalTableItems,
  selectedCount,
  selectedIds,
}: PdfExportModalProps) {
  const [exportMode, setExportMode] = useState<'range' | 'selected' | 'all' | 'month'>(
    () => (selectedCount > 0 ? 'selected' : 'range')
  );
  const [fromRow, setFromRow] = useState<string>('1');
  const [toRow, setToRow] = useState<string>(
    () => String(Math.min(20, Math.max(1, totalTableItems)))
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => getCurrentJalaliMonth()
  );

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sectionTitle =
    type === 'problematic' ? 'کالاهای مشکل‌دار' : 'تصحیح شده توسط من';

  const handleOpenPrintView = () => {
    let url = `/print?type=${type}&mode=${exportMode}`;

    if (exportMode === 'range') {
      const start = Math.max(1, parseInt(fromRow, 10) || 1);
      const end = Math.max(start, parseInt(toRow, 10) || start);
      url += `&fromRow=${start}&toRow=${end}`;
    } else if (exportMode === 'selected') {
      url += `&ids=${selectedIds.join(',')}`;
    } else if (exportMode === 'month') {
      url += `&month=${selectedMonth}&paperSaver=true`;
    }

    // Open print page in a new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-white/5"
      >
        {/* Header */}
        <div className="bg-slate-950/90 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">تبدیل و چاپ PDF</h3>
              <p className="text-xs text-slate-400">بخش: <span className="text-slate-300 font-bold">{sectionTitle}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            انتخاب محدوده خروجی PDF
          </p>

          <div className="space-y-2.5">
            {/* Option: Range */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                exportMode === 'range'
                  ? 'border-red-500/60 bg-red-950/20 ring-1 ring-red-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'range'}
                onChange={() => setExportMode('range')}
                className="mt-1 text-red-600 focus:ring-red-500 accent-red-600"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">
                    بازه ردیف دلخواه (از شماره تا شماره)
                  </span>
                  <span className="text-[11px] bg-red-500/20 text-red-300 border border-red-500/30 font-bold px-2 py-0.5 rounded-md">
                    پیش‌فرض
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  خروجی PDF به صورت اختصاصی بر اساس شماره ردیف‌های انتخابی
                </p>

                {exportMode === 'range' && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        از شماره:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={fromRow}
                        onChange={(e) => setFromRow(e.target.value)}
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden font-bold text-center text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        تا شماره:
                      </label>
                      <input
                        type="number"
                        min={fromRow || '1'}
                        value={toRow}
                        onChange={(e) => setToRow(e.target.value)}
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden font-bold text-center text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Option: Selected */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                exportMode === 'selected'
                  ? 'border-red-500/60 bg-red-950/20 ring-1 ring-red-500/30'
                  : selectedCount === 0
                  ? 'border-slate-800/40 bg-slate-900/20 opacity-40 cursor-not-allowed'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                disabled={selectedCount === 0}
                checked={exportMode === 'selected'}
                onChange={() => setExportMode('selected')}
                className="mt-1 text-red-600 focus:ring-red-500 accent-red-600"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-white block">
                  موارد انتخاب شده با چک‌باکس
                </span>
                <span className="text-xs text-slate-400">
                  {selectedCount > 0
                    ? `${toPersianDigits(selectedCount)} کالا در جدول انتخاب شده است.`
                    : 'هیچ کالایی با تیک انتخاب نشده است.'}
                </span>
              </div>
            </label>

            {/* Option: Iranian Month */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                exportMode === 'month'
                  ? 'border-red-500/60 bg-red-950/20 ring-1 ring-red-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'month'}
                onChange={() => setExportMode('month')}
                className="mt-1 text-red-600 focus:ring-red-500 accent-red-600"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-white block">
                  خروجی تفکیک‌شده بر اساس ماه شمسی
                </span>
                <span className="text-xs text-slate-400">
                  چاپ گزارش تمامی کالاهای ثبت شده در یک ماه خاص از تقویم خورشیدی
                </span>

                {exportMode === 'month' && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">انتخاب ماه:</span>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 font-bold text-white text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-slate-950"
                      >
                        {PERSIAN_MONTH_DETAILS.map((m) => (
                          <option key={m.key} value={m.key} className="bg-slate-900 text-white">
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-bold bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-800/60">
                      <span>🌱 حالت صرفه‌جویی در مصرف کاغذ فعال است (حداقل ۱۰۰ کالا در هر برگه A4).</span>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Option: All */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                exportMode === 'all'
                  ? 'border-red-500/60 bg-red-950/20 ring-1 ring-red-500/30'
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'all'}
                onChange={() => setExportMode('all')}
                className="mt-1 text-red-600 focus:ring-red-500 accent-red-600"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-white block">
                  تمامی کالاهای ثبت‌شده
                </span>
                <span className="text-xs text-slate-400">
                  مجموع {toPersianDigits(totalTableItems)} کالای موجود در این بخش
                </span>
              </div>
            </label>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
            💡 با فشردن دکمه زیر، سند چاپی با استاندارد A4، سربرگ و ته برگ رسمی و تم رنگی قرمز و سفید باز شده و پنجره پرینت مرورگر جهت ذخیره به عنوان PDF آماده می‌گردد.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950/90 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleOpenPrintView}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>تولید و تبدیل به PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
