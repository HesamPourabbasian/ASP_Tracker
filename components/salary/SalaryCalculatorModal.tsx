'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
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
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  ChevronLeft,
} from 'lucide-react';
import { MonthlyBreakdownItem } from '@/lib/types';
import { toPersianDigits, toEnglishDigits, getTodayJalali } from '@/lib/date-utils';
import {
  DEFAULT_TRACK_RATE,
  formatWithCommas,
  calculateSalaryReport,
  getStoredSalaryRate,
  setStoredSalaryRate,
  numberToPersianWords,
} from '@/lib/salary-utils';

interface SalaryCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBreakdown?: MonthlyBreakdownItem[];
  defaultType?: 'corrected' | 'problematic' | 'all';
  onNavigateToMonth?: (monthKey: string) => void;
}

const RATE_PRESETS = [35000, 40000, 45000, 50000, 60000];
const SIMULATOR_PRESETS = [10, 50, 100, 250, 500];

export default function SalaryCalculatorModal({
  isOpen,
  onClose,
  monthlyBreakdown = [],
  defaultType = 'corrected',
  onNavigateToMonth,
}: SalaryCalculatorModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [rate, setRate] = useState<number>(() => getStoredSalaryRate());
  const [editingRate, setEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState<string>(() => String(getStoredSalaryRate()));
  const [calculationType, setCalculationType] = useState<'corrected' | 'problematic' | 'all'>(defaultType);
  const [customTracks, setCustomTracks] = useState<string>('');
  const [internalBreakdown, setInternalBreakdown] = useState<MonthlyBreakdownItem[]>(monthlyBreakdown);
  const [loadingStats, setLoadingStats] = useState(false);
  const [printDate] = useState<string>(() => getTodayJalali());
  const [printTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal breakdown when prop updates
  useEffect(() => {
    if (monthlyBreakdown && monthlyBreakdown.length > 0) {
      setInternalBreakdown(monthlyBreakdown);
    }
  }, [monthlyBreakdown]);

  // Sync calculation type with defaultType when modal opens
  useEffect(() => {
    if (isOpen) {
      setCalculationType(defaultType);
    }
  }, [isOpen, defaultType]);

  // Fetch fresh stats from API whenever modal opens or on refresh
  const fetchFreshStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await fetch('/api/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.monthlyBreakdown) {
          setInternalBreakdown(json.data.monthlyBreakdown);
        }
      }
    } catch (err) {
      console.error('Failed to load fresh salary stats', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFreshStats();
    }
  }, [isOpen, fetchFreshStats]);

  // Listen for background stats or rate updates
  useEffect(() => {
    if (!isOpen) return;
    const handleStatsUpdate = () => fetchFreshStats();
    const handleRateUpdate = () => {
      const currentRate = getStoredSalaryRate();
      setRate(currentRate);
      setRateInput(String(currentRate));
    };

    window.addEventListener('asp_stats_updated', handleStatsUpdate);
    window.addEventListener('asp_salary_rate_updated', handleRateUpdate);
    return () => {
      window.removeEventListener('asp_stats_updated', handleStatsUpdate);
      window.removeEventListener('asp_salary_rate_updated', handleRateUpdate);
    };
  }, [isOpen, fetchFreshStats]);

  // Keyboard navigation & Escape handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingRate) {
          setEditingRate(false);
          setRateInput(String(rate));
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, editingRate, rate]);

  // Calculate report
  const report = useMemo(() => {
    return calculateSalaryReport(internalBreakdown, rate, calculationType);
  }, [internalBreakdown, rate, calculationType]);

  // Calculate counts for each scope tab
  const scopeCounts = useMemo(() => {
    let corrected = 0;
    let problematic = 0;
    let all = 0;
    for (const item of internalBreakdown) {
      corrected += item.correctedCount || 0;
      problematic += item.problematicCount || 0;
      all += item.totalCount || 0;
    }
    return { corrected, problematic, all };
  }, [internalBreakdown]);

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

  const handleSelectPresetRate = (preset: number) => {
    setRate(preset);
    setRateInput(String(preset));
    setStoredSalaryRate(preset);
    setEditingRate(false);
  };

  // Custom Simulator calculation
  const customTrackNum = parseInt(toEnglishDigits(customTracks) || '0', 10);
  const customSalary = !isNaN(customTrackNum) && customTrackNum > 0 ? customTrackNum * rate : 0;
  const customSalaryWords = customSalary > 0 ? numberToPersianWords(customSalary) : '';

  const handleSimulatorPresetAdd = (amount: number) => {
    const current = parseInt(toEnglishDigits(customTracks) || '0', 10) || 0;
    setCustomTracks(String(current + amount));
  };

  // Navigate to month view
  const handleNavigateToMonth = (monthKey: string) => {
    if (onNavigateToMonth) {
      onNavigateToMonth(monthKey);
    } else {
      const targetPath = calculationType === 'problematic' ? '/problematic' : '/corrected';
      router.push(`${targetPath}?month=${monthKey}`);
    }
    onClose();
  };

  // Official Print Slip
  const handlePrint = () => {
    document.body.classList.add('printing-salary-slip');
    window.print();
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-salary-slip');
      window.removeEventListener('afterprint', handleAfterPrint);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    // Fallback timeout if browser does not fire afterprint
    setTimeout(() => {
      document.body.classList.remove('printing-salary-slip');
    }, 2000);
  };

  if (!isOpen || !mounted) return null;

  const calculationTypeTitle =
    calculationType === 'corrected'
      ? 'تصحیح شده توسط من'
      : calculationType === 'problematic'
      ? 'کالاهای مشکل‌دار'
      : 'همه کالاها (مجموع کل)';

  const modalContent = (
    <div id="salary-modal-portal">
      {/* On-Screen Interactive Dark Modal UI */}
      <div
        onClick={onClose}
        className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      >
        <div
          className="relative bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4.5 bg-slate-950/90 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    محاسبه حقوق و درآمد ماهانه
                  </h3>
                  <span className="bg-amber-500/15 text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    {toPersianDigits(formatWithCommas(rate))} ت/ترک
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  محاسبه کارمزد دریافتی بر اساس تعداد ترک‌های وارد شده به تفکیک ماه‌های شمسی
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchFreshStats}
                type="button"
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-750 transition-colors cursor-pointer border border-slate-700/80"
                title="بروزرسانی داده‌های آماری"
              >
                <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                onClick={handlePrint}
                type="button"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                title="چاپ فیش رسمی درآمد و کارکرد"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>چاپ فیش</span>
              </button>
              <button
                onClick={onClose}
                type="button"
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/80"
                aria-label="بستن پنجره"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Rate Setting & Scope Bar */}
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Rate display / editor */}
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0 mt-1 sm:mt-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold block">
                    دستمزد مصوب هر ترک:
                  </span>
                  {editingRate ? (
                    <div className="space-y-2 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={toPersianDigits(rateInput)}
                          onChange={(e) =>
                            setRateInput(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRate();
                            if (e.key === 'Escape') {
                              e.stopPropagation();
                              setEditingRate(false);
                              setRateInput(String(rate));
                            }
                          }}
                          className="w-32 px-2.5 py-1.5 rounded-lg border border-amber-500/50 bg-slate-900 font-black text-white text-sm focus:outline-hidden focus:border-amber-400 text-center"
                          autoFocus
                          placeholder="مثلاً ۴۵۰۰۰"
                        />
                        <span className="text-xs font-bold text-slate-300">تومان</span>
                        <button
                          type="button"
                          onClick={handleSaveRate}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                          title="ذخیره نرخ جدید (Enter)"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleResetRate}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
                          title="بازنشانی به نرخ پیش‌فرض (۴۵,۰۰۰)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quick Rate Presets */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">نرخ‌های پیشنهادی:</span>
                        {RATE_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handleSelectPresetRate(p)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              rate === p
                                ? 'bg-amber-500/30 text-amber-200 border-amber-500/50 font-black'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {toPersianDigits(formatWithCommas(p))}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-black text-white tracking-tight">
                        {toPersianDigits(formatWithCommas(rate))} تومان
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setRateInput(String(rate));
                          setEditingRate(true);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1 cursor-pointer"
                      >
                        <Settings2 className="w-3 h-3" />
                        <span>تغییر نرخ</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3 Scope tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setCalculationType('corrected')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculationType === 'corrected'
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>تصحیح شده</span>
                  <span className="text-[10px] opacity-80">({toPersianDigits(scopeCounts.corrected)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('problematic')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculationType === 'problematic'
                      ? 'bg-red-600/30 text-red-200 border border-red-500/40 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span>مشکل‌دار</span>
                  <span className="text-[10px] opacity-80">({toPersianDigits(scopeCounts.problematic)})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    calculationType === 'all'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-slate-300" />
                  <span>همه</span>
                  <span className="text-[10px] opacity-80">({toPersianDigits(scopeCounts.all)})</span>
                </button>
              </div>
            </div>

            {/* Grand Total Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Tracks */}
              <div className="bg-slate-950/40 rounded-2xl p-4.5 border border-slate-800 shadow-xs flex items-center justify-between hover:border-slate-700 transition-all">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    {calculationType === 'corrected'
                      ? 'مجموع ترک‌های تصحیح‌شده'
                      : calculationType === 'problematic'
                      ? 'مجموع ترک‌های مشکل‌دار'
                      : 'مجموع کل ترک‌ها'}
                  </span>
                  <span className="text-2xl font-black text-white">
                    {toPersianDigits(report.totalTracks)}
                    <span className="text-xs font-normal text-slate-500 mr-1.5">عدد</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-300">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              {/* Total Earnings (Tomans) */}
              <div className="bg-gradient-to-br from-emerald-950/30 to-slate-900 rounded-2xl p-4.5 border border-emerald-500/40 shadow-xs flex items-center justify-between ring-1 ring-emerald-500/20">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block mb-1">
                    مجموع کل حقوق و دریافتی
                  </span>
                  <span className="text-2xl font-black text-emerald-400 tracking-tight">
                    {toPersianDigits(formatWithCommas(report.totalTomans))}
                    <span className="text-xs font-bold text-emerald-500 mr-1.5">تومان</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              {/* Total Rials */}
              <div className="bg-slate-950/40 rounded-2xl p-4.5 border border-slate-800 shadow-xs flex items-center justify-between hover:border-slate-700 transition-all">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    معادل ریالی در سیستم حسابداری
                  </span>
                  <span className="text-xl font-black text-slate-200 tracking-tight">
                    {toPersianDigits(formatWithCommas(report.totalRials))}
                    <span className="text-xs font-normal text-slate-500 mr-1.5">ریال</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-950/40 border border-amber-850/40 flex items-center justify-center text-amber-400">
                  <Coins className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Persian Words Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 flex items-center gap-2.5 text-xs text-emerald-300 font-medium">
              <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                مبلغ کل حقوق قابل پرداخت به حروف:{' '}
                <strong className="font-black text-emerald-200">{report.totalWords}</strong>
              </span>
            </div>

            {/* Monthly Breakdown Table / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  <span>ریز کارکرد و حقوق ماهانه (تقویم هجری خورشیدی)</span>
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {toPersianDigits(report.monthlyBreakdown.length)} دوره دارای کارکرد
                </span>
              </div>

              {loadingStats && report.monthlyBreakdown.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-medium border border-slate-800 rounded-2xl flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>در حال دریافت و به‌روزرسانی آمار...</span>
                </div>
              ) : report.monthlyBreakdown.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium border border-dashed border-slate-800 rounded-2xl">
                  هیچ رکوردی برای محاسبه حقوق در بخش «{calculationTypeTitle}» یافت نشد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {report.monthlyBreakdown.map((m) => (
                    <div
                      key={m.yearMonthKey}
                      className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-950/80 shadow-xs transition-all space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">
                            ماه {m.monthName} {toPersianDigits(m.year)}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-850 border border-slate-750 text-slate-300">
                            {toPersianDigits(m.yearMonthKey)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavigateToMonth(m.month)}
                          className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                          title="مشاهده کالاهای ثبت شده در این ماه"
                        >
                          <span>مشاهده ترک‌ها</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Calculations */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-850 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">تعداد ترک‌ها:</span>
                          <span className="font-extrabold text-white text-sm">
                            {toPersianDigits(m.count)} مورد
                          </span>
                        </div>

                        <div className="text-left">
                          <span className="text-[11px] text-slate-400 block mb-0.5">فرمول محاسبه:</span>
                          <span className="font-semibold text-slate-400 text-[11px]">
                            {toPersianDigits(m.count)} × {toPersianDigits(formatWithCommas(m.ratePerTrack))}
                          </span>
                        </div>
                      </div>

                      {/* Salary Amount Badge */}
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">حقوق این ماه:</span>
                        <span className="text-base font-black text-emerald-400 tracking-tight">
                          {toPersianDigits(formatWithCommas(m.totalTomans))} تومان
                        </span>
                      </div>

                      {/* Words & Progress */}
                      <div className="space-y-1.5 pt-0.5">
                        <div className="text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="truncate max-w-[80%]" title={m.totalWords}>
                            به حروف: <span className="font-semibold text-slate-300">{m.totalWords}</span>
                          </span>
                          <span className="font-bold text-slate-400 text-[10px]">
                            {toPersianDigits(m.percentage)}٪ کل
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
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
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border border-amber-500/30 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    ماشین‌حساب دستی دستمزد ترک‌ها (شبیه‌ساز کارمزد)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">
                  مبنای هر ترک: <strong className="text-amber-300">{toPersianDigits(formatWithCommas(rate))} تومان</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    تعداد فرضی ترک:
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً ۱۰۰"
                    value={toPersianDigits(customTracks)}
                    onChange={(e) =>
                      setCustomTracks(toEnglishDigits(e.target.value).replace(/[^0-9]/g, ''))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold text-white focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="col-span-2 flex flex-col justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">دستمزد محاسبه‌شده:</span>
                      <span className="text-sm sm:text-base font-black text-emerald-400">
                        {toPersianDigits(formatWithCommas(customSalary))} تومان
                      </span>
                    </div>
                    {customSalary > 0 && (
                      <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                        معادل {toPersianDigits(formatWithCommas(customSalary * 10))} ریال
                      </span>
                    )}
                  </div>
                  {customSalaryWords && (
                    <span className="text-[10px] text-slate-400 mt-1 truncate" title={customSalaryWords}>
                      به حروف: <strong className="text-slate-300">{customSalaryWords}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Simulator Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400">افزایش سریع:</span>
                {SIMULATOR_PRESETS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleSimulatorPresetAdd(amt)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    +{toPersianDigits(amt)}
                  </button>
                ))}
                {customTracks && (
                  <button
                    type="button"
                    onClick={() => setCustomTracks('')}
                    className="mr-auto px-2 py-0.5 rounded-md bg-red-950/40 hover:bg-red-900/40 text-red-300 text-[10px] font-bold border border-red-800/40 transition-colors cursor-pointer"
                  >
                    پاک کردن
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FileText className="w-4 h-4 text-slate-500" />
              <span>تاریخ گزارش: {toPersianDigits(getTodayJalali())}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold transition-all hover:bg-slate-750 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>چاپ فیش رسمی</span>
              </button>
              <button
                onClick={onClose}
                type="button"
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official A4 Printable Salary Slip (Hidden on Screen, Printed on Paper) */}
      <div className="salary-slip-sheet max-w-[210mm] mx-auto p-8 font-sans text-black bg-white" dir="rtl">
        {/* Slip Header */}
        <div className="border-b-2 border-red-600 pb-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600 text-white font-black text-2xl flex items-center justify-center rounded-xl">
              ASP
            </div>
            <div>
              <h1 className="font-black text-xl text-slate-900 tracking-tight">
                فیش رسمی کارکرد و محاسبه دستمزد
              </h1>
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                سامانه مدیریت و ردیابی کاتالوگ محصولات CTR Aftermarket
              </p>
            </div>
          </div>

          <div className="text-left font-mono text-xs text-slate-700 space-y-1" dir="rtl">
            <div>
              <span className="font-bold">شماره فیش:</span>{' '}
              <span className="font-mono">ASP-SAL-{toPersianDigits(getTodayJalali().replace(/\//g, ''))}</span>
            </div>
            <div>
              <span className="font-bold">تاریخ صدور:</span>{' '}
              <span>{toPersianDigits(printDate)}</span>
            </div>
            <div>
              <span className="font-bold">ساعت:</span>{' '}
              <span>{toPersianDigits(printTime)}</span>
            </div>
          </div>
        </div>

        {/* Sub-Header Meta */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-600">مبنای گزارش:</span>{' '}
            <strong className="text-slate-900">{calculationTypeTitle}</strong>
          </div>
          <div className="text-left">
            <span className="font-bold text-slate-600">نرخ مصوب هر ترک:</span>{' '}
            <strong className="text-slate-900">{toPersianDigits(formatWithCommas(rate))} تومان</strong>
          </div>
        </div>

        {/* Grand Total Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border border-slate-300 p-3 rounded-xl bg-slate-50 text-center">
            <span className="text-[11px] text-slate-600 block mb-1">مجموع کل ترک‌ها</span>
            <span className="text-xl font-black text-slate-900">
              {toPersianDigits(report.totalTracks)} عدد
            </span>
          </div>
          <div className="border border-red-200 p-3 rounded-xl bg-red-50 text-center">
            <span className="text-[11px] text-red-800 font-bold block mb-1">مجموع حقوق ناخالص</span>
            <span className="text-xl font-black text-red-700">
              {toPersianDigits(formatWithCommas(report.totalTomans))} تومان
            </span>
          </div>
          <div className="border border-slate-300 p-3 rounded-xl bg-slate-50 text-center">
            <span className="text-[11px] text-slate-600 block mb-1">معادل ریالی در حسابداری</span>
            <span className="text-lg font-black text-slate-900">
              {toPersianDigits(formatWithCommas(report.totalRials))} ریال
            </span>
          </div>
        </div>

        {/* Words Banner */}
        <div className="bg-slate-100 border border-slate-300 p-3 rounded-xl mb-6 text-xs text-slate-800">
          <strong>مبلغ کل به حروف:</strong> {report.totalWords}
        </div>

        {/* Monthly Breakdown Table */}
        <div className="mb-8">
          <h3 className="font-black text-sm text-slate-900 mb-2">
            جدول تفکیک کارکرد و درآمد ماهانه:
          </h3>
          <table className="w-full text-right border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="border border-slate-300 p-2 text-center w-12">ردیف</th>
                <th className="border border-slate-300 p-2 text-right">دوره کارکرد (ماه و سال)</th>
                <th className="border border-slate-300 p-2 text-center w-24">تعداد ترک</th>
                <th className="border border-slate-300 p-2 text-left w-32">نرخ واحد (تومان)</th>
                <th className="border border-slate-300 p-2 text-left w-36">کارمزد ناخالص (تومان)</th>
                <th className="border border-slate-300 p-2 text-center w-20">درصد از کل</th>
              </tr>
            </thead>
            <tbody>
              {report.monthlyBreakdown.map((m, idx) => (
                <tr key={m.yearMonthKey} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="border border-slate-300 p-2 text-center font-bold">
                    {toPersianDigits(idx + 1)}
                  </td>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900">
                    ماه {m.monthName} {toPersianDigits(m.year)} ({toPersianDigits(m.yearMonthKey)})
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-black">
                    {toPersianDigits(m.count)}
                  </td>
                  <td className="border border-slate-300 p-2 text-left font-mono">
                    {toPersianDigits(formatWithCommas(m.ratePerTrack))}
                  </td>
                  <td className="border border-slate-300 p-2 text-left font-black text-slate-900">
                    {toPersianDigits(formatWithCommas(m.totalTomans))}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-bold">
                    {toPersianDigits(m.percentage)}٪
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-red-600 text-white font-black">
                <td className="border border-slate-300 p-2 text-center" colSpan={2}>
                  جمع کل
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  {toPersianDigits(report.totalTracks)}
                </td>
                <td className="border border-slate-300 p-2 text-left font-mono">
                  -
                </td>
                <td className="border border-slate-300 p-2 text-left text-sm">
                  {toPersianDigits(formatWithCommas(report.totalTomans))}
                </td>
                <td className="border border-slate-300 p-2 text-center">
                  ۱۰۰٪
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Official Signatures Section */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-300 text-center text-xs">
          <div className="p-3 border border-dashed border-slate-300 rounded-xl space-y-12">
            <span className="font-bold text-slate-700 block">امضای مسئول ثبت و اپراتور</span>
            <div className="text-[10px] text-slate-400">تاریخ و امضا</div>
          </div>
          <div className="p-3 border border-dashed border-slate-300 rounded-xl space-y-12">
            <span className="font-bold text-slate-700 block">تایید سرپرست بخش فنی کاتالوگ</span>
            <div className="text-[10px] text-slate-400">تاریخ و امضا</div>
          </div>
          <div className="p-3 border border-dashed border-slate-300 rounded-xl space-y-12">
            <span className="font-bold text-slate-700 block">تایید و پرداخت امور مالی CTR</span>
            <div className="text-[10px] text-slate-400">مهر و امضا</div>
          </div>
        </div>

        {/* Slip Footer Notice */}
        <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-500">
          این فیش به صورت خودکار توسط سامانه ASP Tracker تولید گردیده و فاقد هرگونه خط‌خوردگی دارای اعتبار رسمی می‌باشد.
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

