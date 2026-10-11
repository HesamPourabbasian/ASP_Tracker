'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, ExternalLink, Calendar, Tag, Barcode } from 'lucide-react';
import { UnifiedProduct } from '@/lib/types';
import { toPersianDigits } from '@/lib/date-utils';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen || !product) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(product.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-950 text-white px-6 py-4.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/60 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">توضیحات کامل کالا</h3>
              <p className="text-xs text-slate-400">
                ردیف {toPersianDigits(product.rowNumber)}: {product.productName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Product Meta Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Tag className="w-3.5 h-3.5 text-red-400" />
                <span>برند:</span>
              </div>
              <span className="font-bold text-white">{product.brand}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Barcode className="w-3.5 h-3.5 text-red-400" />
                <span>{siteCodeLabel}:</span>
              </div>
              <span className="font-mono font-bold text-red-300">{product.siteCode}</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>تاریخ:</span>
              </div>
              <span className="font-medium text-white font-mono">
                {toPersianDigits(product.date)}
              </span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                <span>لینک:</span>
              </div>
              {product.link ? (
                <a
                  href={product.link.startsWith('http') ? product.link : `https://${product.link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 font-bold hover:underline truncate block"
                >
                  مشاهده در سایت
                </a>
              ) : (
                <span className="text-slate-500">ندارد</span>
              )}
            </div>
          </div>

          {/* Description Text Box */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">متن توضیحات:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 hover:border-slate-600 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">کپی شد</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی توضیحات</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text font-normal">
              {product.description}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950/80 px-6 py-3.5 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-medium text-sm transition-colors border border-slate-700 cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
}
