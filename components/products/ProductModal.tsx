'use client';

import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Edit3, Loader2, Calendar, Link2, Tag, Barcode, FileText, Check } from 'lucide-react';
import { UnifiedProduct, ProductType } from '@/lib/types';
import { getTodayJalali, normalizeJalaliDate, toPersianDigits, isValidJalaliDate } from '@/lib/date-utils';
import { useToast } from '@/components/ui/ToastContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ProductType;
  productToEdit: UnifiedProduct | null;
  onSuccess: () => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  type,
  productToEdit,
  onSuccess,
}: ProductModalProps) {
  const toast = useToast();
  const isEditing = Boolean(productToEdit);

  const siteCodeLabel =
    type === 'problematic' ? 'کد موجود در سایت' : 'کد اصلاح شده سایت';

  const title = isEditing
    ? type === 'problematic'
      ? 'ویرایش کالای مشکل‌دار'
      : 'ویرایش کالای تصحیح‌شده'
    : type === 'problematic'
    ? 'افزودن کالای مشکل‌دار'
    : 'افزودن کالای تصحیح‌شده';

  // Form State
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [link, setLink] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setProductName(productToEdit.productName || '');
        setBrand(productToEdit.brand || '');
        setSiteCode(productToEdit.siteCode || '');
        setLink(productToEdit.link || '');
        setDate(productToEdit.date || getTodayJalali());
        setDescription(productToEdit.description || '');
      } else {
        setProductName('');
        setBrand('');
        setSiteCode('');
        setLink('');
        setDate(getTodayJalali());
        setDescription('');
      }
      setErrors({});
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!productName.trim()) {
      newErrors.productName = 'وارد کردن نام محصول الزامی است.';
    }
    if (!brand.trim()) {
      newErrors.brand = 'وارد کردن نام برند الزامی است.';
    }
    if (!siteCode.trim()) {
      newErrors.siteCode = `وارد کردن ${siteCodeLabel} الزامی است.`;
    }
    if (!date.trim()) {
      newErrors.date = 'وارد کردن تاریخ الزامی است.';
    } else {
      const normalized = normalizeJalaliDate(date);
      if (!isValidJalaliDate(normalized)) {
        newErrors.date = 'فرمت تاریخ معتبر نیست (مثال: 1403/06/10).';
      }
    }
    if (!description.trim()) {
      newErrors.description = 'وارد کردن توضیحات کامل الزامی است.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload = {
      productName: productName.trim(),
      brand: brand.trim(),
      siteCode: siteCode.trim(),
      link: link.trim() || undefined,
      date: normalizeJalaliDate(date),
      description: description.trim(),
    };

    const endpoint =
      type === 'problematic'
        ? isEditing
          ? `/api/problematic/${productToEdit?.id}`
          : '/api/problematic'
        : isEditing
        ? `/api/corrected/${productToEdit?.id}`
        : '/api/corrected';

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        toast.error(json.error || 'خطایی در ثبت اطلاعات رخ داد.');
        return;
      }

      toast.success(
        isEditing
          ? 'اطلاعات کالا با موفقیت بروزرسانی شد.'
          : 'کالا با موفقیت اضافه شد.'
      );

      // Trigger stats refresh event
      window.dispatchEvent(new Event('asp_stats_updated'));

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving product:', err);
      toast.error('خطای شبکه یا سرور. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{title}</h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'تغییر و بروزرسانی اطلاعات ثبت‌شده' : 'ثبت ردیف جدید در جدول'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Field: Product Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نام محصول <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="مثال: لنت ترمز جلو هیوندای آزرا"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 transition-all ${
                    errors.productName
                      ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-slate-300 focus:border-red-600 focus:ring-red-600/20'
                  }`}
                />
              </div>
              {errors.productName && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.productName}</p>
              )}
            </div>

            {/* Row with Brand & Site Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Brand */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  برند <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="مثال: CTR یا Genuine"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 transition-all ${
                      errors.brand
                        ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  />
                </div>
                {errors.brand && (
                  <p className="text-xs text-red-600 font-medium mt-1">{errors.brand}</p>
                )}
              </div>

              {/* Field: Site Code */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {siteCodeLabel} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={siteCode}
                    onChange={(e) => setSiteCode(e.target.value)}
                    placeholder="مثال: CTR-58101-3FA00"
                    dir="ltr"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-medium focus:outline-hidden focus:ring-2 transition-all text-left ${
                      errors.siteCode
                        ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  />
                </div>
                {errors.siteCode && (
                  <p className="text-xs text-red-600 font-medium mt-1">{errors.siteCode}</p>
                )}
              </div>
            </div>

            {/* Row with Link & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field: Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  لینک کالا <span className="text-slate-400 text-[10px] font-normal">(اختیاری)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com/product/..."
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 text-sm font-sans focus:outline-hidden text-left"
                  />
                </div>
              </div>

              {/* Field: Date */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    تاریخ <span className="text-red-600">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setDate(getTodayJalali())}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
                  >
                    امروز
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="1403/06/10"
                    dir="ltr"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-center focus:outline-hidden focus:ring-2 transition-all ${
                      errors.date
                        ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-red-600 font-medium mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            {/* Field: Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                توضیحات کامل <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="شرح کامل ایراد، شماره فنی مغایر، عدم تطابق تصویر یا نحوه اصلاح صورت گرفته..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-hidden focus:ring-2 transition-all resize-y ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500/20 bg-red-50/30'
                    : 'border-slate-300 focus:border-red-600 focus:ring-red-600/20'
                }`}
              />
              {errors.description && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'بروزرسانی کالا' : 'ذخیره و افزودن به جدول'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
