'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Printer, ArrowRight, Loader2, FileSpreadsheet, ExternalLink } from 'lucide-react';
import { UnifiedProduct, ProductType } from '@/lib/types';
import { toPersianDigits, getTodayJalali, formatJalaliHumanReadable } from '@/lib/date-utils';

function PrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = (searchParams.get('type') || 'problematic') as ProductType;
  const mode = searchParams.get('mode') || 'all';
  const fromRow = searchParams.get('fromRow');
  const toRow = searchParams.get('toRow');
  const ids = searchParams.get('ids');

  const [items, setItems] = useState<UnifiedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [printDate, setPrintDate] = useState<string>('');
  const [printTime, setPrintTime] = useState<string>('');

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

        const res = await fetch(url);
        const json = await res.json();

        if (res.ok && json.success) {
          let fetchedItems: UnifiedProduct[] = json.data.items || [];

          if (mode === 'selected' && ids) {
            const idList = ids.split(',');
            fetchedItems = fetchedItems.filter((i) => idList.includes(i.id));
          }

          setItems(fetchedItems);
        }
      } catch (err) {
        console.error('Error fetching data for print:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, mode, fromRow, toRow, ids]);

  const handlePrint = () => {
    window.print();
  };

  const getRangeLabel = () => {
    if (mode === 'range' && fromRow && toRow) {
      return `شماره ${toPersianDigits(fromRow)} تا ${toPersianDigits(toRow)}`;
    }
    if (mode === 'selected') {
      return `${toPersianDigits(items.length)} ردیف انتخاب شده`;
    }
    return `تمامی کالاها (${toPersianDigits(items.length)} ردیف)`;
  };

  return (
    <div className="bg-white min-h-screen font-sans text-black antialiased p-0 sm:p-4">
      {/* Top Floating Control Bar - Hidden on print */}
      <div className="no-print bg-slate-900 text-white rounded-2xl p-4 mb-6 shadow-xl flex flex-wrap items-center justify-between gap-4 sticky top-4 z-50 border border-slate-700">
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.close()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بستن پنجره</span>
          </button>
          <button
            onClick={handlePrint}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ / ذخیره به عنوان PDF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-3" />
          <span className="font-bold text-sm">در حال آماده‌سازی سند جهت چاپ...</span>
        </div>
      ) : (
        /* Printable Document Container */
        <div className="w-full max-w-[210mm] mx-auto bg-white p-4 sm:p-6 print:p-0">
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
                    گزارش رسمی سامانه پیگیری و مدیریت کاتالوگ محصولات
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

          {/* Printable Table */}
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-medium">
              هیچ داده‌ای در این بازه جهت چاپ یافت نشد.
            </div>
          ) : (
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
          )}

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
