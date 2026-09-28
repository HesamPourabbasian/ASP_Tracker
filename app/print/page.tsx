'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Printer, ArrowRight, Loader2, Leaf, TableProperties } from 'lucide-react';
import { UnifiedProduct, ProductType } from '@/lib/types';
import {
  toPersianDigits,
  toEnglishDigits,
  getTodayJalali,
  normalizeJalaliDate,
  getIranianMonthName,
} from '@/lib/date-utils';

function PrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = (searchParams.get('type') || 'problematic') as ProductType;
  const mode = searchParams.get('mode') || 'all';
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const fromRow = searchParams.get('fromRow');
  const toRow = searchParams.get('toRow');
  const ids = searchParams.get('ids');
  const paperSaverParam = searchParams.get('paperSaver');

  const [items, setItems] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [printDate, setPrintDate] = useState<string>('');
  const [printTime, setPrintTime] = useState<string>('');

  // Paper saver mode: defaults to true if month is set or paperSaverParam === 'true'
  const [paperSaver, setPaperSaver] = useState<boolean>(() => {
    return Boolean(month) || mode === 'month' || paperSaverParam === 'true';
  });

  const sectionTitle =
    type === 'problematic' ? 'کالاهای مشکل‌دار' : 'تصحیح شده توسط من';
  const siteCodeHeader =
    type === 'problematic' ? 'کد موجود در سایت' : 'کد اصلاح شده سایت';

  useEffect(() => {
    // Set Jalali print timestamp
    const now = new Date();
    setPrintDate(getTodayJalali());
    setPrintTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );

    const fetchData = async () => {
      setLoading(true);
      try {
        const endpoint = type === 'problematic' ? '/api/problematic' : '/api/corrected';
        let url = `${endpoint}?pageSize=all`;

        if (mode === 'range' && fromRow && toRow) {
          url += `&fromRow=${fromRow}&toRow=${toRow}`;
        }
        if (month) {
          url += `&month=${month}`;
        }
        if (year) {
          url += `&year=${year}`;
        }

        const res = await fetch(url);
        const json = await res.json();

        if (res.ok && json.success) {
          let fetchedItems: UnifiedProduct[] = json.data.items || [];

          if (mode === 'selected' && ids) {
            const idList = ids.split(',');
            fetchedItems = fetchedItems.filter((i) => idList.includes(i.id));
          }

          // Always sort items from newer to latest (descending date)
          fetchedItems.sort((a, b) => {
            const dateA = normalizeJalaliDate(toEnglishDigits(a.date || ''));
            const dateB = normalizeJalaliDate(toEnglishDigits(b.date || ''));
            const comp = dateB.localeCompare(dateA);
            if (comp !== 0) return comp;
            if (a.createdAt && b.createdAt) {
              const timeA = new Date(a.createdAt).getTime();
              const timeB = new Date(b.createdAt).getTime();
              return timeB - timeA;
            }
            return (b.rowNumber || 0) - (a.rowNumber || 0);
          });

          setItems(fetchedItems);
        }
      } catch (err) {
        console.error('Error fetching data for print:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, mode, month, year, fromRow, toRow, ids]);

  const handlePrint = () => {
    window.print();
  };

  const getRangeLabel = () => {
    if (month) {
      const mName = getIranianMonthName(month);
      return `تفکیک ماه ${mName} (${toPersianDigits(items.length)} ردیف)`;
    }
    if (mode === 'range' && fromRow && toRow) {
      return `شماره ${toPersianDigits(fromRow)} تا ${toPersianDigits(toRow)}`;
    }
    if (mode === 'selected') {
      return `${toPersianDigits(items.length)} ردیف انتخاب شده`;
    }
    return `تمامی کالاها (${toPersianDigits(items.length)} ردیف)`;
  };

  // Chunk items into 100 items per printed page for paper saver mode
  const ITEMS_PER_SHEET = 100;
  const sheets = useMemo(() => {
    if (!paperSaver) return [];
    const chunks: UnifiedProduct[][] = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_SHEET) {
      chunks.push(items.slice(i, i + ITEMS_PER_SHEET));
    }
    return chunks;
  }, [items, paperSaver]);

  // Render a compact sub-table for a single column (up to 50 rows)
  const renderCompactColumnTable = (columnItems: UnifiedProduct[], colKey: string) => {
    return (
      <table className="paper-saver-table w-full text-right border-collapse border border-slate-300">
        <thead>
          <tr className="bg-red-600 text-white font-bold text-[7.5pt]">
            <th className="border border-slate-300 p-1 text-center w-[26px]">ردیف</th>
            <th className="border border-slate-300 p-1 text-right">نام کالا</th>
            <th className="border border-slate-300 p-1 text-center w-[68px]">کد سایت</th>
            <th className="border border-slate-300 p-1 text-right w-[48px]">برند</th>
            <th className="border border-slate-300 p-1 text-center w-[54px]">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          {columnItems.map((item, idx) => (
            <tr
              key={`${colKey}-${item.id}`}
              className={`text-[7pt] leading-tight ${
                idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <td className="border border-slate-300 p-1 text-center font-bold text-slate-900">
                {toPersianDigits(item.rowNumber)}
              </td>
              <td
                className="border border-slate-300 p-1 font-bold text-slate-900 truncate max-w-[140px]"
                title={item.productName}
              >
                {item.productName}
              </td>
              <td
                className="border border-slate-300 p-1 font-mono font-bold text-slate-800 text-center truncate max-w-[68px]"
                dir="ltr"
                title={item.siteCode}
              >
                {item.siteCode}
              </td>
              <td
                className="border border-slate-300 p-1 font-medium text-slate-700 truncate max-w-[48px]"
                title={item.brand || ''}
              >
                {item.brand || '-'}
              </td>
              <td className="border border-slate-300 p-1 text-center font-medium text-slate-800 whitespace-nowrap">
                {toPersianDigits(item.date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-black antialiased p-0 sm:p-4 print:bg-white print:p-0">
      {/* Top Floating Control Bar - Hidden on print */}
      <div className="no-print bg-slate-900 text-white rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4 sticky top-4 z-50 border border-slate-700 max-w-[210mm] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center font-black text-white">
            ASP
          </div>
          <div>
            <h1 className="font-bold text-base">پیش‌نمایش چاپ و تبدیل به PDF</h1>
            <p className="text-xs text-slate-400">
              بخش {sectionTitle} — {getRangeLabel()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Paper Saver */}
          <button
            onClick={() => setPaperSaver((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              paperSaver
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="حالت دو ستونه فشرده با حداقل ۱۰۰ کالا در هر برگه جهت صرفه‌جویی در مصرف کاغذ"
          >
            {paperSaver ? (
              <Leaf className="w-4 h-4 text-emerald-400" />
            ) : (
              <TableProperties className="w-4 h-4 text-slate-400" />
            )}
            <span>
              صرفه‌جویی کاغذ (۱۰۰ کالا/برگه):{' '}
              <strong className={paperSaver ? 'text-emerald-400' : 'text-slate-400'}>
                {paperSaver ? 'فعال' : 'غیرفعال'}
              </strong>
            </span>
          </button>

          <button
            onClick={() => window.close()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بستن</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / ذخیره PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
          <span className="font-bold text-sm">در حال آماده‌سازی سند جهت چاپ...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="w-full max-w-[210mm] mx-auto bg-white p-12 rounded-xl shadow-sm text-center text-slate-500 font-medium">
          هیچ داده‌ای در این بازه جهت چاپ یافت نشد.
        </div>
      ) : paperSaver ? (
        /* Paper Saver Mode: 100 items per A4 sheet (2 columns of 50 items) */
        <div className="space-y-6 print:space-y-0">
          {sheets.map((sheetItems, sheetIdx) => {
            const half = Math.min(50, Math.ceil(sheetItems.length / 2));
            const rightColItems = sheetItems.slice(0, half);
            const leftColItems = sheetItems.slice(half);

            return (
              <div
                key={sheetIdx}
                className="print-page-sheet w-full max-w-[210mm] mx-auto bg-white p-4 sm:p-5 print:p-0 shadow-md print:shadow-none rounded-xl print:rounded-none border border-slate-200 print:border-none"
              >
                {/* Compact Sheet Header */}
                <div className="border-b-2 border-red-600 pb-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-red-600 text-white font-black text-sm flex items-center justify-center rounded-lg">
                        ASP
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="font-black text-sm tracking-tight text-slate-900">
                            ASP TRACKER
                          </h1>
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {sectionTitle}
                          </span>
                          {month && (
                            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                              ماه {getIranianMonthName(month)}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                          گزارش رسمی سامانه کاتالوگ CTR — مرتب‌شده از جدیدترین به قدیمی‌ترین
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono text-[9px] text-slate-600 space-y-0.5" dir="rtl">
                      <div>
                        <span className="font-bold text-slate-900">تاریخ چاپ:</span>{' '}
                        <span>{toPersianDigits(printDate)}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">برگه:</span>{' '}
                        <span className="font-black text-red-700">
                          {toPersianDigits(sheetIdx + 1)} از {toPersianDigits(sheets.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-Column Side-by-Side Grid (50 rows per column = 100 rows per page) */}
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  {/* Right Column: First 50 items */}
                  <div>{renderCompactColumnTable(rightColItems, `sheet-${sheetIdx}-right`)}</div>

                  {/* Left Column: Next 50 items */}
                  <div>
                    {leftColItems.length > 0 ? (
                      renderCompactColumnTable(leftColItems, `sheet-${sheetIdx}-left`)
                    ) : (
                      <div className="h-full border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400">
                        پایان اقلام این برگه
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Sheet Footer */}
                <div className="mt-2 pt-1 border-t border-slate-300 flex items-center justify-between text-[8pt] text-slate-500">
                  <span>
                    🌱 گزارش فشرده صرفه‌جویی کاغذ (۱۰۰ کالا در هر برگه A4) — ASP Tracker
                  </span>
                  <span>
                    اقلام این برگه: <strong>{toPersianDigits(sheetItems.length)}</strong> مورد (برگه{' '}
                    <strong>{toPersianDigits(sheetIdx + 1)}</strong> از{' '}
                    <strong>{toPersianDigits(sheets.length)}</strong>)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Print Table Mode (with full description and links) */
        <div className="w-full max-w-[210mm] mx-auto bg-white p-4 sm:p-6 print:p-0 shadow-md print:shadow-none rounded-xl print:rounded-none border border-slate-200 print:border-none">
          {/* Document Header */}
          <div className="border-b-2 border-red-600 pb-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 text-white font-black text-2xl flex items-center justify-center rounded-lg">
                  ASP
                </div>
                <div>
                  <h1 className="font-black text-2xl tracking-tight text-slate-900">
                    ASP <span className="text-red-600">TRACKER</span>
                  </h1>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    گزارش رسمی سامانه پیگیری و مدیریت کاتالوگ محصولات (جدیدترین به قدیمی‌ترین)
                  </p>
                </div>
              </div>

              <div className="text-left font-mono text-xs text-slate-600 space-y-1" dir="rtl">
                <div>
                  <span className="font-bold text-slate-900">تاریخ تولید گزارش:</span>{' '}
                  <span>{toPersianDigits(printDate)}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">ساعت گزارش:</span>{' '}
                  <span>{toPersianDigits(printTime)}</span>
                </div>
              </div>
            </div>

            {/* Sub-header banner */}
            <div className="mt-4 bg-slate-100 p-2.5 rounded-lg flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">عنوان بخش:</span>
                <span className="text-sm font-black text-red-700">{sectionTitle}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">محدوده گزارش:</span>
                <span className="text-xs font-bold bg-white px-2.5 py-1 rounded border border-slate-300 text-slate-800">
                  {getRangeLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Full Width Table */}
          <table className="print-table w-full text-right border-collapse border border-slate-300">
            <thead>
              <tr className="bg-red-600 text-white font-bold text-[11px]">
                <th className="border border-slate-300 p-2 text-center w-12">شماره</th>
                <th className="border border-slate-300 p-2 text-right w-44">نام محصول</th>
                <th className="border border-slate-300 p-2 text-right w-24">برند</th>
                <th className="border border-slate-300 p-2 text-right w-36">{siteCodeHeader}</th>
                <th className="border border-slate-300 p-2 text-center w-28">لینک</th>
                <th className="border border-slate-300 p-2 text-center w-24">تاریخ</th>
                <th className="border border-slate-300 p-2 text-right">توضیحات کامل</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`text-xs ${
                    idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                  } break-inside-avoid`}
                >
                  <td className="border border-slate-300 p-2 text-center font-bold text-slate-900">
                    {toPersianDigits(item.rowNumber)}
                  </td>
                  <td className="border border-slate-300 p-2 font-bold text-slate-900 leading-snug">
                    {item.productName}
                  </td>
                  <td className="border border-slate-300 p-2 font-semibold text-slate-800">
                    {item.brand}
                  </td>
                  <td className="border border-slate-300 p-2 font-mono font-bold text-slate-800 text-left" dir="ltr">
                    {item.siteCode}
                  </td>
                  <td className="border border-slate-300 p-2 text-center text-[10px]">
                    {item.link ? (
                      <span className="text-red-700 underline break-all" dir="ltr">
                        {item.link.length > 25 ? `${item.link.substring(0, 25)}...` : item.link}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-medium text-slate-800 whitespace-nowrap">
                    {toPersianDigits(item.date)}
                  </td>
                  <td className="border border-slate-300 p-2 text-slate-800 text-[11px] leading-relaxed">
                    {item.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Document Footer */}
          <div className="mt-6 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
            <span>سامانه ASP Tracker — گزارش خودکار کاتالوگ CTR</span>
            <span>
              مجموع سطرها: <strong>{toPersianDigits(items.length)}</strong> مورد
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
          <span className="font-bold text-sm">در حال بارگذاری پیش‌نمایش چاپ...</span>
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
