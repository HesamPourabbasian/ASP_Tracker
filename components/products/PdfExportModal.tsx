'use client';

import React, { useState, useEffect } from 'react';
import { X, Printer, FileDown, CheckCircle, Sliders, Hash } from 'lucide-react';
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
  const [exportMode, setExportMode] = useState<'range' | 'selected' | 'all' | 'month'>('range');
  const [fromRow, setFromRow] = useState<string>('1');
  const [toRow, setToRow] = useState<string>('20');
  const [selectedMonth, setSelectedMonth] = useState<string>('06');

  useEffect(() => {
    if (isOpen) {
      if (selectedCount > 0) {
        setExportMode('selected');
      } else {
        setExportMode('range');
      }
      setFromRow('1');
      setToRow(String(Math.min(20, Math.max(1, totalTableItems))));
      setSelectedMonth(getCurrentJalaliMonth());
    }
  }, [isOpen, selectedCount, totalTableItems]);

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
      url += `&month=${selectedMonth}`;
    }

    // Open print page in a new window/tab
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">تبدیل و چاپ PDF</h3>
              <p className="text-xs text-slate-400">بخش: {sectionTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            انتخاب محدوده خروجی PDF
          </p>

          <div className="space-y-2.5">
            {/* Option: Range */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'range'
                  ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/10'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'range'}
                onChange={() => setExportMode('range')}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">
                    بازه ردیف دلخواه (از شماره تا شماره)
                  </span>
                  <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">
                    پیش‌فرض
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  خروجی PDF به صورت اختصاصی بر اساس شماره ردیف‌های انتخابی
                </p>

                {exportMode === 'range' && (
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-red-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        از شماره:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={fromRow}
                        onChange={(e) => setFromRow(e.target.value)}
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-600 focus:outline-hidden font-bold text-center text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        تا شماره:
                      </label>
                      <input
                        type="number"
                        min={fromRow || '1'}
                        value={toRow}
                        onChange={(e) => setToRow(e.target.value)}
                        dir="ltr"
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-600 focus:outline-hidden font-bold text-center text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Option: Selected */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'selected'
                  ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/10'
                  : selectedCount === 0
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                disabled={selectedCount === 0}
                checked={exportMode === 'selected'}
                onChange={() => setExportMode('selected')}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-900 block">
                  موارد انتخاب شده با چک‌باکس
                </span>
                <span className="text-xs text-slate-500">
                  {selectedCount > 0
                    ? `${toPersianDigits(selectedCount)} کالا در جدول انتخاب شده است.`
                    : 'هیچ کالایی با تیک انتخاب نشده است.'}
                </span>
              </div>
            </label>

            {/* Option: Iranian Month */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'month'
                  ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/10'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'month'}
                onChange={() => setExportMode('month')}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-900 block">
                  خروجی تفکیک‌شده بر اساس ماه شمسی
                </span>
                <span className="text-xs text-slate-500">
                  چاپ گزارش تمامی کالاهای ثبت شده در یک ماه خاص از تقویم خورشیدی
                </span>

                {exportMode === 'month' && (
                  <div className="mt-3 pt-3 border-t border-red-100 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">انتخاب ماه:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-800 text-xs focus:border-red-600 bg-white"
                    >
                      {PERSIAN_MONTH_DETAILS.map((m) => (
                        <option key={m.key} value={m.key}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </label>

            {/* Option: All */}
            <label
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                exportMode === 'all'
                  ? 'border-red-600 bg-red-50/40 ring-2 ring-red-600/10'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'all'}
                onChange={() => setExportMode('all')}
                className="mt-1 text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <span className="font-bold text-sm text-slate-900 block">
                  تمامی کالاهای ثبت‌شده
                </span>
                <span className="text-xs text-slate-500">
                  مجموع {toPersianDigits(totalTableItems)} کالای موجود در این بخش
                </span>
              </div>
            </label>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            💡 با فشردن دکمه زیر، سند چاپی با استاندارد A4، سربرگ و ته برگ رسمی و تم رنگی قرمز و سفید باز شده و پنجره پرینت مرورگر جهت ذخیره به عنوان PDF آماده می‌گردد.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleOpenPrintView}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>تولید و تبدیل به PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
