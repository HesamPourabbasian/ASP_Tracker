'use client';

import React, { useState } from 'react';
import {
  Wallet,
  X,
  Printer,
  Calendar,
  Layers,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Settings2,
  Check,
  RotateCcw,
  Calculator,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { MonthlyBreakdownItem } from '@/lib/types';
import { toPersianDigits, toEnglishDigits, getTodayJalali } from '@/lib/date-utils';
import {
  DEFAULT_TRACK_RATE,
  formatWithCommas,
  calculateSalaryReport,
  getStoredSalaryRate,
  setStoredSalaryRate,
} from '@/lib/salary-utils';

interface SalaryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBreakdown?: MonthlyBreakdownItem[];
  defaultType?: 'corrected' | 'problematic' | 'all';
  onNavigateToMonth?: (monthKey: string) => void;
}

export default function SalaryCalculatorModal({
  isOpen,
  onClose,
  monthlyBreakdown = [],
  defaultType = 'corrected',
  onNavigateToMonth,
}: SalaryCalculatorModalProps) {
  const [rate, setRate] = useState<number>(() => getStoredSalaryRate());
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState<string>(() => String(getStoredSalaryRate()));
  const [calculationType, setCalculationType] = useState<'corrected' | 'problematic' | 'all'>(defaultType);
  const [customTracks, setCustomTracks] = useState<string>('');

  if (!isOpen) return null;

  const report = calculateSalaryReport(monthlyBreakdown, rate, calculationType);

  const handleSaveRate = () => {
    const parsed = parseInt(toEnglishDigits(rateInput), 10);
    if (!isNaN(parsed) && parsed > 0) {
      setRate(parsed);
      setStoredSalaryRate(parsed);
      setEditingRate(false);
    }
  };

  const handleResetRate = () => {
    setRate(DEFAULT_TRACK_RATE);
    setRateInput(String(DEFAULT_TRACK_RATE));
    setStoredSalaryRate(DEFAULT_TRACK_RATE);
    setEditingRate(false);
  };

  // Custom Simulator calculation
  const customTrackNum = parseInt(toEnglishDigits(customTracks) || '0', 10);
  const customSalary = !isNaN(customTrackNum) && customTrackNum > 0 ? customTrackNum * rate : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  محاسبه حقوق و درآمد ماهانه
                </h3>
                <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  {toPersianDigits(formatWithCommas(rate))} ت/ترک
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                محاسبه کارمزد دریافتی بر اساس تعداد ترک‌های وارد شده به تفکیک ماه‌های شمسی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-600"
              title="چاپ فیش گزارش درآمد"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>چاپ فیش</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
              aria-label="بستن پنجره"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Rate Setting & Scope Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Rate display / editor */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block">
                  دستمزد مصوب هر ترک:
                </span>
                {editingRate ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="text"
                      value={toPersianDigits(rateInput)}
                      onChange={(e) => setRateInput(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''))}
                      className="w-28 px-2 py-1 rounded-lg border border-amber-400 bg-white font-black text-slate-900 text-sm focus:outline-hidden text-center"
                      autoFocus
                    />
                    <span className="text-xs font-bold text-slate-600">تومان</span>
                    <button
                      type="button"
                      onClick={handleSaveRate}
                      className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      title="ذخیره نرخ جدید"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetRate}
                      className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                      title="بازنشانی به نرخ پیش‌فرض (۴۵,۰۰۰)"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-slate-900 tracking-tight">
                      {toPersianDigits(formatWithCommas(rate))} تومان
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingRate(true)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold underline flex items-center gap-1 cursor-pointer"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>تغییر نرخ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scope tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setCalculationType('corrected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  calculationType === 'corrected'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تصحیح شده توسط من
              </button>
              <button
                type="button"
                onClick={() => setCalculationType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  calculationType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه کالاها
              </button>
            </div>
          </div>

          {/* Grand Total Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Tracks */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  مجموع کل ترک‌ها
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {toPersianDigits(report.totalTracks)}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">عدد</span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            {/* Total Earnings (Tomans) */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-white rounded-2xl p-4.5 border border-emerald-200/80 shadow-xs flex items-center justify-between ring-2 ring-emerald-500/10">
              <div>
                <span className="text-xs font-semibold text-emerald-800 block mb-1">
                  مجموع کل حقوق و دریافتی
                </span>
                <span className="text-2xl font-black text-emerald-700 tracking-tight">
                  {toPersianDigits(formatWithCommas(report.totalTomans))}
                  <span className="text-xs font-bold text-emerald-600 mr-1.5">تومان</span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Total Rials */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-4.5 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">
                  معادل ریالی در سیستم حسابداری
                </span>
                <span className="text-xl font-black text-slate-800 tracking-tight">
                  {toPersianDigits(formatWithCommas(report.totalRials))}
                  <span className="text-xs font-normal text-slate-400 mr-1.5">ریال</span>
                </span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Persian Words Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
            <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              مبلغ کل حقوق قابل پرداخت به حروف: <strong className="font-black text-emerald-950">{report.totalWords}</strong>
            </span>
          </div>

          {/* Monthly Breakdown Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <span>ریز کارکرد و حقوق ماهانه (تقویم هجری خورشیدی)</span>
              </h4>
              <span className="text-xs text-slate-400 font-medium">
                {toPersianDigits(report.monthlyBreakdown.length)} ماه ثبت شده
              </span>
            </div>

            {report.monthlyBreakdown.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl">
                هیچ رکوردی برای محاسبه حقوق یافت نشد.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {report.monthlyBreakdown.map((m) => (
                  <div
                    key={m.yearMonthKey}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">
                          ماه {m.monthName} {toPersianDigits(m.year)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {toPersianDigits(m.yearMonthKey)}
                        </span>
                      </div>

                      {onNavigateToMonth && (
                        <button
                          type="button"
                          onClick={() => {
                            onNavigateToMonth(m.month);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline"
                        >
                          <span>مشاهده ترک‌ها</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Calculations */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-500 block mb-0.5">تعداد ترک‌ها:</span>
                        <span className="font-extrabold text-slate-800 text-sm">
                          {toPersianDigits(m.count)} مورد
                        </span>
                      </div>

                      <div className="text-left">
                        <span className="text-[11px] text-slate-500 block mb-0.5">فرمول محاسبه:</span>
                        <span className="font-semibold text-slate-600 text-[11px]">
                          {toPersianDigits(m.count)} × {toPersianDigits(formatWithCommas(m.ratePerTrack))}
                        </span>
                      </div>
                    </div>

                    {/* Salary Amount Badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">حقوق این ماه:</span>
                      <span className="text-base font-black text-emerald-600 tracking-tight">
                        {toPersianDigits(formatWithCommas(m.totalTomans))} تومان
                      </span>
                    </div>

                    {/* Words & Progress */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span className="truncate max-w-[80%]" title={m.totalWords}>
                          به حروف: <span className="font-semibold text-slate-700">{m.totalWords}</span>
                        </span>
                        <span className="font-bold text-slate-700 text-[10px]">
                          {toPersianDigits(m.percentage)}٪ کل
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${m.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Custom Track Simulator */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-white border border-amber-200/60 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs sm:text-sm font-black text-slate-900">
                ماشین‌حساب دستی دستمزد ترک‌ها
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  تعداد فرضی ترک:
                </label>
                <input
                  type="text"
                  placeholder="مثلاً ۱۰۰"
                  value={toPersianDigits(customTracks)}
                  onChange={(e) => setCustomTracks(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  نرخ مبنا:
                </span>
                <span className="text-xs font-bold text-slate-700 py-2 block">
                  {toPersianDigits(formatWithCommas(rate))} تومان به ازای هر ترک
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-500 block">دستمزد محاسبه‌شده:</span>
                <span className="text-sm font-black text-emerald-600">
                  {toPersianDigits(formatWithCommas(customSalary))} تومان
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>تاریخ گزارش: {toPersianDigits(getTodayJalali())}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-100 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>چاپ فیش</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
