'use client';

import React, { useState } from 'react';
import { X, Copy, Check, FileText, ExternalLink, Calendar, Tag, Barcode } from 'lucide-react';
import { UnifiedProduct } from '@/lib/types';
import { toPersianDigits, formatJalaliHumanReadable } from '@/lib/date-utils';

interface DescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: UnifiedProduct | null;
  siteCodeLabel: string;
}

export default function DescriptionModal({
  isOpen,
  onClose,
  product,
  siteCodeLabel,
}: DescriptionModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(product.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b-2 border-red-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">توضیحات کامل کالا</h3>
              <p className="text-xs text-slate-400">
                ردیف {toPersianDigits(product.rowNumber)}: {product.productName}
              </p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Product Meta Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Tag className="w-3.5 h-3.5 text-red-600" />
                <span>برند:</span>
              </div>
              <span className="font-bold text-slate-800">{product.brand}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Barcode className="w-3.5 h-3.5 text-red-600" />
                <span>{siteCodeLabel}:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{product.siteCode}</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                <span>تاریخ:</span>
              </div>
              <span className="font-medium text-slate-800">
                {toPersianDigits(product.date)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                <ExternalLink className="w-3.5 h-3.5 text-red-600" />
                <span>لینک:</span>
              </div>
              {product.link ? (
                <a
                  href={product.link.startsWith('http') ? product.link : `https://${product.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-700 font-bold hover:underline truncate block"
                >
                  مشاهده در سایت
                </a>
              ) : (
                <span className="text-slate-400">ندارد</span>
              )}
            </div>
          </div>

          {/* Description Text Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">متن توضیحات:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1 rounded-lg transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی توضیحات</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text font-normal">
              {product.description}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
