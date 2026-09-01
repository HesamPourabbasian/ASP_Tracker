'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, AlertOctagon, Loader2, ArrowLeft } from 'lucide-react';
import { UnifiedProduct, ProductType } from '@/lib/types';
import { toPersianDigits } from '@/lib/date-utils';
import { useToast } from '@/components/ui/ToastContext';

export type DeleteMode = 'single' | 'selected' | 'range' | 'all';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: DeleteMode;
  type: ProductType;
  productToDelete?: UnifiedProduct | null;
  selectedIds?: string[];
  totalTableItems: number;
  onSuccess: () => void;
}

export default function DeleteModal({
  isOpen,
  onClose,
  mode,
  type,
  productToDelete,
  selectedIds = [],
  totalTableItems,
  onSuccess,
}: DeleteModalProps) {
  const toast = useToast();
  const [fromRow, setFromRow] = useState<string>('1');
  const [toRow, setToRow] = useState<string>('10');
  const [confirmAllChecked, setConfirmAllChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmAllChecked(false);
      if (mode === 'range') {
        setFromRow('1');
        setToRow(String(Math.min(10, Math.max(1, totalTableItems))));
      }
    }
  }, [isOpen, mode, totalTableItems]);

  if (!isOpen) return null;

  const sectionName =
    type === 'problematic' ? 'کالاهای مشکل‌دار' : 'کالاهای تصحیح‌شده';

  const endpoint = type === 'problematic' ? '/api/problematic' : '/api/corrected';

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      if (mode === 'single' && productToDelete) {
        const res = await fetch(`${endpoint}/${productToDelete.id}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error || 'خطا در حذف کالا.');
          return;
        }
        toast.success('کالا با موفقیت حذف شد.');
      } else if (mode === 'selected') {
        if (!selectedIds.length) {
          toast.warning('هیچ کالایی انتخاب نشده است.');
          return;
        }
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error || 'خطا در حذف کالاها.');
          return;
        }
        toast.success(json.message || 'کالاهای انتخاب شده با موفقیت حذف شدند.');
      } else if (mode === 'range') {
        const start = parseInt(fromRow, 10);
        const end = parseInt(toRow, 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          toast.error('بازه شماره وارد شده نامعتبر است.');
          setIsDeleting(false);
          return;
        }
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromRow: start, toRow: end }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error || 'خطا در حذف بازه انتخابی.');
          return;
        }
        toast.success(json.message || 'بازه انتخابی با موفقیت حذف شد.');
      } else if (mode === 'all') {
        if (!confirmAllChecked) {
          toast.warning('لطفاً تیک تایید نهایی را علامت بزنید.');
          setIsDeleting(false);
          return;
        }
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ all: true }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          toast.error(json.error || 'خطا در حذف تمام کالاها.');
          return;
        }
        toast.success(`تمامی ${sectionName} با موفقیت حذف شدند.`);
      }

      // Trigger stats refresh
      window.dispatchEvent(new Event('asp_stats_updated'));

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('خطای ارتباط با سرور در هنگام حذف.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-red-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/20 text-white">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {mode === 'single' && 'تایید حذف کالا'}
                {mode === 'selected' && 'حذف کالاهای انتخاب‌شده'}
                {mode === 'range' && 'حذف بازه‌ای از کالاها'}
                {mode === 'all' && 'حذف تمام کالاها (هشدار جدی)'}
              </h3>
              <p className="text-xs text-red-100">عملیات حذف از پایگاه‌داده</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {mode === 'single' && productToDelete && (
            <div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">
                آیا از حذف کالای زیر مطمئن هستید؟
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">شماره ردیف:</span>
                  <span className="font-bold text-slate-900">
                    {toPersianDigits(productToDelete.rowNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">نام محصول:</span>
                  <span className="font-bold text-slate-900">{productToDelete.productName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">برند:</span>
                  <span className="font-semibold text-slate-800">{productToDelete.brand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">کد سایت:</span>
                  <span className="font-mono font-semibold text-slate-800">{productToDelete.siteCode}</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'selected' && (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  تعداد <strong className="font-black text-red-600">{toPersianDigits(selectedIds.length)}</strong> کالا انتخاب شده است. آیا می‌خواهید این موارد برای همیشه حذف شوند؟
                </p>
              </div>
            </div>
          )}

          {mode === 'range' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                بازه ردیف‌های مدنظر جهت حذف را مشخص نمایید:
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    از شماره ردیف:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={fromRow}
                    onChange={(e) => setFromRow(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-600 focus:outline-hidden font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    تا شماره ردیف:
                  </label>
                  <input
                    type="number"
                    min={fromRow || '1'}
                    value={toRow}
                    onChange={(e) => setToRow(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-red-600 focus:outline-hidden font-bold text-center"
                  />
                </div>
              </div>

              {parseInt(fromRow) > 0 && parseInt(toRow) >= parseInt(fromRow) && (
                <div className="text-xs text-slate-600 bg-red-50/60 p-3 rounded-lg border border-red-100 flex items-center justify-between">
                  <span>تعداد کالاهای مشمول این بازه:</span>
                  <span className="font-bold text-red-700">
                    {toPersianDigits(parseInt(toRow) - parseInt(fromRow) + 1)} کالا
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'all' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="text-sm text-red-950 space-y-1">
                  <p className="font-bold text-red-700">
                    آیا مطمئن هستید که می‌خواهید تمام کالاها حذف شوند؟
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed">
                    با اجرای این عملیات، تمامی رکورد‌های بخش <strong>{sectionName}</strong> به صورت برگشت‌ناپذیر از پایگاه‌داده حذف خواهند شد.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={confirmAllChecked}
                  onChange={(e) => setConfirmAllChecked(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded-sm border-slate-300 focus:ring-red-500"
                />
                <span className="text-xs font-bold text-slate-800">
                  تایید می‌کنم که تمام داده‌های این بخش برای همیشه پاک شوند.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (mode === 'all' && !confirmAllChecked)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال حذف...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>
                  {mode === 'all'
                    ? 'حذف کامل داده‌ها'
                    : mode === 'range'
                    ? 'حذف بازه انتخابی'
                    : mode === 'selected'
                    ? 'حذف موارد انتخاب‌شده'
                    : 'حذف کالا'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
