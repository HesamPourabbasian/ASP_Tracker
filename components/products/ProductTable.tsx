'use client';

import React, { useState } from 'react';
import {
  Plus,
  Printer,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Calendar,
  FileSpreadsheet,
  Copy,
  Check,
} from 'lucide-react';
import { UnifiedProduct, ProductType, PaginationInfo } from '@/lib/types';
import { toPersianDigits, groupTracksByIranianMonth } from '@/lib/date-utils';
import ProductModal from './ProductModal';
import DeleteModal, { DeleteMode } from './DeleteModal';
import DescriptionModal from './DescriptionModal';
import PdfExportModal from './PdfExportModal';

interface ProductTableProps {
  type: ProductType;
  items: UnifiedProduct[];
  pagination: PaginationInfo;
  loading: boolean;
  onRefresh: () => void;
}

export default function ProductTable({
  type,
  items,
  pagination,
  loading,
  onRefresh,
}: ProductTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<UnifiedProduct | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopySiteCode = (e: React.MouseEvent, id: string, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Description Modal state
  const [descriptionModalProduct, setDescriptionModalProduct] = useState<UnifiedProduct | null>(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');
  const [productToDelete, setProductToDelete] = useState<UnifiedProduct | null>(null);

  // PDF Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Iranian monthly grouping state (default: true to show month by month)
  const [isGroupedByMonth, setIsGroupedByMonth] = useState(true);
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});

  const toggleMonthCollapse = (monthKey: string) => {
    setCollapsedMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const isProblematic = type === 'problematic';
  const siteCodeColumnTitle = isProblematic
    ? 'کد موجود در سایت'
    : 'کد اصلاح شده سایت';
  const addButtonLabel = isProblematic
    ? '+ افزودن کالای مشکل‌دار'
    : '+ افزودن کالای تصحیح‌شده';

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = items.map((i) => i.id);
      setSelectedIds(pageIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openAddModal = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: UnifiedProduct) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  const openSingleDeleteModal = (product: UnifiedProduct) => {
    setProductToDelete(product);
    setDeleteMode('single');
    setIsDeleteModalOpen(true);
  };

  const openSelectedDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteMode('selected');
    setIsDeleteModalOpen(true);
  };

  const openRangeDeleteModal = () => {
    setDeleteMode('range');
    setIsDeleteModalOpen(true);
  };

  const openAllDeleteModal = () => {
    setDeleteMode('all');
    setIsDeleteModalOpen(true);
  };

  const allOnPageSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const monthGroups = isGroupedByMonth ? groupTracksByIranianMonth(items) : [];

  const renderRow = (item: UnifiedProduct) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <tr
        key={item.id}
        className={`group transition-colors ${
          isSelected
            ? 'bg-red-950/30 hover:bg-red-950/45 border-b border-red-900/30'
            : 'hover:bg-slate-800/40 border-b border-slate-800/60'
        }`}
      >
        {/* Checkbox */}
        <td className="py-3.5 px-4 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleToggleRow(item.id)}
            className="w-4 h-4 text-red-600 rounded-sm bg-slate-800 border-slate-700 focus:ring-red-500 cursor-pointer"
            aria-label={`انتخاب ردیف ${item.rowNumber}`}
          />
        </td>

        {/* Row Number */}
        <td className="py-3.5 px-3 text-center font-black text-xs text-slate-400 bg-slate-950/30 group-hover:bg-slate-900/50 font-mono">
          {toPersianDigits(item.rowNumber)}
        </td>

        {/* Product Name */}
        <td className="py-3.5 px-4 font-bold text-slate-100 leading-snug">
          {item.productName}
        </td>

        {/* Brand */}
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700/80">
            {item.brand}
          </span>
        </td>

        {/* Site Code with 1-click Copy */}
        <td className="py-3.5 px-4">
          <button
            type="button"
            onClick={(e) => handleCopySiteCode(e, item.id, item.siteCode)}
            className="group/code inline-flex items-center gap-1.5 font-mono text-xs font-bold bg-slate-800/90 hover:bg-slate-800 text-red-300 hover:text-red-200 px-2.5 py-1 rounded-md border border-slate-700/80 hover:border-red-500/50 transition-all cursor-pointer shadow-2xs"
            title="کلیک جهت کپی کد سایت"
          >
            <span dir="ltr">{item.siteCode}</span>
            {copiedCodeId === item.id ? (
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3 h-3 text-slate-500 group-hover/code:text-red-400 shrink-0 opacity-70 group-hover/code:opacity-100 transition-opacity" />
            )}
          </button>
        </td>

        {/* Link */}
        <td className="py-3.5 px-4 text-center">
          {item.link ? (
            <a
              href={
                item.link.startsWith('http')
                  ? item.link
                  : `https://${item.link}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/60 px-2.5 py-1 rounded-lg border border-red-800/60 transition-colors"
              title={item.link}
            >
              <span>مشاهده</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-slate-500 text-xs">-</span>
          )}
        </td>

        {/* Date */}
        <td className="py-3.5 px-4 text-center font-mono text-xs font-medium text-slate-300 whitespace-nowrap">
          {toPersianDigits(item.date)}
        </td>

        {/* Description with Truncate & Read More */}
        <td className="py-3.5 px-4">
          <div className="flex items-center justify-between gap-2">
            <p
              className="text-xs text-slate-300 truncate max-w-xs leading-relaxed"
              title={item.description}
            >
              {item.description}
            </p>
            <button
              type="button"
              onClick={() => setDescriptionModalProduct(item)}
              className="text-[11px] font-bold text-red-400 hover:text-red-300 underline shrink-0 cursor-pointer"
            >
              مشاهده
            </button>
          </div>
        </td>

        {/* Action Buttons */}
        <td className="py-3.5 px-4 text-center whitespace-nowrap">
          <div className="flex items-center justify-center gap-1.5">
            {/* Edit */}
            <button
              onClick={() => openEditModal(item)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="ویرایش کالا"
              aria-label="ویرایش کالا"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => openSingleDeleteModal(item)}
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/60 transition-colors cursor-pointer"
              title="حذف کالا"
              aria-label="حذف کالا"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Right side: Add Product Button & Monthly Division Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{addButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGroupedByMonth((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isGroupedByMonth
                ? 'bg-slate-100 text-slate-950 border-slate-100 font-black shadow-md'
                : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title={
              isGroupedByMonth
                ? 'کلیک جهت بازگشت به جدول یکپارچه و ساده'
                : 'کلیک جهت تفکیک و دسته‌بندی سطرها بر اساس ماه‌های تقویم شمسی'
            }
          >
            <Calendar className={`w-4 h-4 ${isGroupedByMonth ? 'text-red-600' : 'text-red-400'}`} />
            <span>{isGroupedByMonth ? 'جدول یکپارچه (بدون تفکیک)' : 'تفکیک ماه به ماه سطرها'}</span>
          </button>
        </div>

        {/* Left side: PDF & Deletion Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Export Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="تبدیل بازه یا موارد به PDF"
          >
            <Printer className="w-4 h-4 text-red-400" />
            <span>تبدیل به PDF</span>
          </button>

          {/* Range Delete Button */}
          <button
            onClick={openRangeDeleteModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-800/60 bg-red-950/40 hover:bg-red-900/50 text-red-300 font-bold text-xs transition-colors cursor-pointer"
            title="حذف بر اساس بازه شماره ردیف"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف بازه‌ای</span>
          </button>

          {/* Delete All Button */}
          <button
            onClick={openAllDeleteModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-red-800/60 hover:bg-red-950/40 hover:text-red-300 text-slate-400 font-bold text-xs transition-colors cursor-pointer"
            title="حذف تمامی کالاها"
          >
            <span>حذف همه</span>
          </button>
        </div>
      </div>

      {/* Floating Selected Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-3.5 px-5 shadow-2xl border border-red-500/80 ring-2 ring-red-500/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold">
              تعداد <strong className="text-red-400 font-black">{toPersianDigits(selectedIds.length)}</strong> کالا انتخاب شده است
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              <span>چاپ موارد انتخابی</span>
            </button>
            <button
              onClick={openSelectedDeleteModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف این موارد</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              لغو انتخاب
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/90 text-slate-300 text-xs font-black border-b border-slate-800">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm bg-slate-800 border-slate-700 focus:ring-red-500 cursor-pointer"
                    aria-label="انتخاب همه ردیف‌های صفحه"
                  />
                </th>

                {/* Columns */}
                <th className="py-3.5 px-3 w-16 text-center text-slate-400 font-extrabold">شماره</th>
                <th className="py-3.5 px-4 text-slate-200 min-w-[200px]">نام محصول</th>
                <th className="py-3.5 px-4 text-slate-200 min-w-[120px]">برند</th>
                <th className="py-3.5 px-4 text-slate-200 min-w-[160px]">{siteCodeColumnTitle}</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">لینک</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">تاریخ</th>
                <th className="py-3.5 px-4 min-w-[240px]">توضیحات کامل</th>
                <th className="py-3.5 px-4 text-center w-28">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                /* Skeleton rows */
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse border-b border-slate-800/40">
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-36 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-48 h-4 bg-slate-800 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-14 h-4 bg-slate-800 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 rounded-2xl bg-red-950/60 text-red-400 flex items-center justify-center mb-4 border border-red-800/60 shadow-inner">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-base text-white mb-1">
                        هنوز کالایی ثبت نشده است.
                      </h3>
                      <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                        جهت افزودن اولین مورد به جدول، از دکمه زیر استفاده نمایید.
                      </p>
                      <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{addButtonLabel}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : isGroupedByMonth ? (
                /* Monthly Grouped View */
                monthGroups.map((group) => {
                  const isCollapsed = collapsedMonths[group.yearMonthKey];
                  const allGroupSelected =
                    group.items.length > 0 &&
                    group.items.every((it) => selectedIds.includes(it.id));

                  const handleToggleGroupSelection = () => {
                    const groupItemIds = group.items.map((it) => it.id);
                    if (allGroupSelected) {
                      setSelectedIds((prev) => prev.filter((id) => !groupItemIds.includes(id)));
                    } else {
                      setSelectedIds((prev) => Array.from(new Set([...prev, ...groupItemIds])));
                    }
                  };

                  return (
                    <React.Fragment key={group.yearMonthKey}>
                      {/* Month Header Banner Row */}
                      <tr className="bg-slate-850/90 border-y border-slate-750">
                        <td colSpan={9} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={allGroupSelected}
                                onChange={handleToggleGroupSelection}
                                className="w-4 h-4 text-red-600 rounded-sm bg-slate-800 border-slate-700 focus:ring-red-500 cursor-pointer"
                                title={`انتخاب تمام کالاهای ماه ${group.label}`}
                              />
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-400" />
                                <span className="font-black text-sm text-white">
                                  ماه {group.label}
                                </span>
                                <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                  {toPersianDigits(group.count)} کالا
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleMonthCollapse(group.yearMonthKey)}
                              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                            >
                              <span>{isCollapsed ? 'نمایش سطرها' : 'بستن سطرها'}</span>
                              {isCollapsed ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronUp className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Month Rows with independent month-by-month sequential numbering */}
                      {!isCollapsed &&
                        group.items.map((item, idx) =>
                          renderRow({ ...item, rowNumber: idx + 1 })
                        )}
                    </React.Fragment>
                  );
                })
              ) : (
                /* Table Rows */
                items.map(renderRow)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isProductModalOpen && (
        <ProductModal
          key={productToEdit?.id || 'new'}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          type={type}
          productToEdit={productToEdit}
          onSuccess={onRefresh}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteModal
          key={`${deleteMode}-${productToDelete?.id || 'bulk'}`}
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
          }}
          mode={deleteMode}
          type={type}
          productToDelete={productToDelete}
          selectedIds={selectedIds}
          totalTableItems={pagination.totalItems}
          onSuccess={() => {
            setSelectedIds([]);
            onRefresh();
          }}
        />
      )}

      {Boolean(descriptionModalProduct) && (
        <DescriptionModal
          isOpen={Boolean(descriptionModalProduct)}
          onClose={() => setDescriptionModalProduct(null)}
          product={descriptionModalProduct}
          siteCodeLabel={siteCodeColumnTitle}
        />
      )}

      {isPdfModalOpen && (
        <PdfExportModal
          key={`pdf-${selectedIds.length}`}
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          type={type}
          totalTableItems={pagination.totalItems}
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
        />
      )}
    </div>
  );
}
