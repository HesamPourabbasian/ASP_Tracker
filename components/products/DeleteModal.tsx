'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, AlertTriangle, AlertOctagon, Loader2 } from 'lucide-react';
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
  const [toRow, setToRow] = useState<string>(() => String(Math.min(10, Math.max(1, totalTableItems))));
  const [confirmAllChecked, setConfirmAllChecked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isDeleting]);

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
    <div
      onClick={() => !isDeleting && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl shadow-2xl border border-red-900/50 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 py-4.5 flex items-center justify-between border-b border-red-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-800/60 shadow-inner">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {mode === 'single' && 'تایید حذف کالا'}
                {mode === 'selected' && 'حذف کالاهای انتخاب‌شده'}
                {mode === 'range' && 'حذف بازه‌ای از کالاها'}
                {mode === 'all' && 'حذف تمام کالاها (هشدار جدی)'}
              </h3>
              <p className="text-xs text-red-300">عملیات حذف از پایگاه‌داده</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {mode === 'single' && productToDelete && (
            <div>
              <p className="text-sm text-slate-300 leading-relaxed mb-3">
                آیا از حذف کالای زیر مطمئن هستید؟
              </p>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">شماره ردیف:</span>
                  <span className="font-bold text-white font-mono">
                    {toPersianDigits(productToDelete.rowNumber)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">نام محصول:</span>
                  <span className="font-bold text-white">{productToDelete.productName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">برند:</span>
                  <span className="font-semibold text-slate-200">{productToDelete.brand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">کد سایت:</span>
                  <span className="font-mono font-semibold text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-900/40">{productToDelete.siteCode}</span>
                </div>
              </div>
            </div>
          )}

          {mode === 'selected' && (
            <div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
                <p className="text-sm font-medium leading-relaxed">
                  تعداد <strong className="font-black text-red-400">{toPersianDigits(selectedIds.length)}</strong> کالا انتخاب شده است. آیا می‌خواهید این موارد برای همیشه حذف شوند؟
                </p>
              </div>
            </div>
          )}

          {mode === 'range' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                بازه ردیف‌های مدنظر جهت حذف را مشخص نمایید:
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    از شماره ردیف:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={fromRow}
                    onChange={(e) => setFromRow(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:border-red-500 focus:outline-hidden font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    تا شماره ردیف:
                  </label>
                  <input
                    type="number"
                    min={fromRow || '1'}
                    value={toRow}
                    onChange={(e) => setToRow(e.target.value)}
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-800 text-white focus:border-red-500 focus:outline-hidden font-bold text-center"
                  />
                </div>
              </div>

              {parseInt(fromRow) > 0 && parseInt(toRow) >= parseInt(fromRow) && (
                <div className="text-xs text-slate-300 bg-red-950/30 p-3 rounded-lg border border-red-900/50 flex items-center justify-between">
                  <span>تعداد کالاهای مشمول این بازه:</span>
                  <span className="font-bold text-red-300">
                    {toPersianDigits(parseInt(toRow) - parseInt(fromRow) + 1)} کالا
                  </span>
                </div>
              )}
            </div>
          )}

          {mode === 'all' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/70 flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div className="text-sm text-red-200 space-y-1">
                  <p className="font-bold text-red-300">
                    آیا مطمئن هستید که می‌خواهید تمام کالاها حذف شوند؟
                  </p>
                  <p className="text-xs text-red-200/80 leading-relaxed">
                    با اجرای این عملیات، تمامی رکورد‌های بخش <strong>{sectionName}</strong> به صورت برگشت‌ناپذیر از پایگاه‌داده حذف خواهند شد.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 cursor-pointer transition-colors select-none">
                <input
                  type="checkbox"
                  checked={confirmAllChecked}
                  onChange={(e) => setConfirmAllChecked(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded-sm bg-slate-800 border-slate-700 focus:ring-red-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-200">
                  تایید می‌کنم که تمام داده‌های این بخش برای همیشه پاک شوند.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950/80 px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-sm transition-colors cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (mode === 'all' && !confirmAllChecked)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
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
