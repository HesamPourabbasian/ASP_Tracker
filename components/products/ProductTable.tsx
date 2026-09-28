'use client';

import React, { useState } from 'react';
import {
  Plus,
  Printer,
  Trash2,
  Edit2,
  ExternalLink,
  Eye,
  CheckSquare,
  Square,
  AlertOctagon,
  FileSpreadsheet,
  Layers,
  ChevronDown,
  ChevronUp,
  Calendar,
  Info,
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

  // Description Modal state
  const [descriptionModalProduct, setDescriptionModalProduct] = useState<UnifiedProduct | null>(null);

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');
  const [productToDelete, setProductToDelete] = useState<UnifiedProduct | null>(null);

  // PDF Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Fast range selection in header
  const [rangeFrom, setRangeFrom] = useState('');
  const [rangeTo, setRangeTo] = useState('');

  // Iranian monthly grouping state
  const [isGroupedByMonth, setIsGroupedByMonth] = useState(false);
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

  const handleApplyRangeSelection = () => {
    const from = parseInt(rangeFrom, 10);
    const to = parseInt(rangeTo, 10);
    if (isNaN(from) || isNaN(to) || from < 1 || to < from) {
      return;
    }
    const matchingIds = items
      .filter((item) => item.rowNumber >= from && item.rowNumber <= to)
      .map((item) => item.id);
    setSelectedIds(matchingIds);
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
            ? 'bg-red-50/60 hover:bg-red-50/80'
            : 'hover:bg-slate-50/80'
        }`}
      >
        {/* Checkbox */}
        <td className="py-3.5 px-4 text-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleToggleRow(item.id)}
            className="w-4 h-4 text-red-600 rounded-sm border-slate-300 focus:ring-red-500 cursor-pointer"
            aria-label={`انتخاب ردیف ${item.rowNumber}`}
          />
        </td>

        {/* Row Number */}
        <td className="py-3.5 px-3 text-center font-black text-xs text-slate-900 bg-slate-50/50 group-hover:bg-slate-100/50">
          {toPersianDigits(item.rowNumber)}
        </td>

        {/* Product Name */}
        <td className="py-3.5 px-4 font-bold text-slate-900 leading-snug">
          {item.productName}
        </td>

        {/* Brand */}
        <td className="py-3.5 px-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            {item.brand}
          </span>
        </td>

        {/* Site Code */}
        <td className="py-3.5 px-4">
          <span
            className="font-mono text-xs font-bold text-slate-900 bg-red-50/60 text-red-950 px-2 py-1 rounded-md border border-red-100 inline-block text-left"
            dir="ltr"
          >
            {item.siteCode}
          </span>
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
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
              title={item.link}
            >
              <span>مشاهده</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-slate-400 text-xs">-</span>
          )}
        </td>

        {/* Date */}
        <td className="py-3.5 px-4 text-center font-mono text-xs font-medium text-slate-700 whitespace-nowrap">
          {toPersianDigits(item.date)}
        </td>

        {/* Description with Truncate & Read More */}
        <td className="py-3.5 px-4">
          <div className="flex items-center justify-between gap-2">
            <p
              className="text-xs text-slate-600 truncate max-w-xs leading-relaxed"
              title={item.description}
            >
              {item.description}
            </p>
            <button
              type="button"
              onClick={() => setDescriptionModalProduct(item)}
              className="text-[11px] font-bold text-red-600 hover:text-red-700 underline shrink-0 cursor-pointer"
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
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="ویرایش کالا"
              aria-label="ویرایش کالا"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => openSingleDeleteModal(item)}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
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
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Right side: Add Product Button & Monthly Division Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>{addButtonLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGroupedByMonth((prev) => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isGroupedByMonth
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="تفکیک سطرهای جدول بر اساس ماه‌های تقویم شمسی"
          >
            <Calendar className={`w-4 h-4 ${isGroupedByMonth ? 'text-red-400' : 'text-red-600'}`} />
            <span>{isGroupedByMonth ? 'جدول یکپارچه' : 'تفکیک ماهانه سطرها'}</span>
          </button>
        </div>

        {/* Left side: PDF & Deletion Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Export Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            title="تبدیل بازه یا موارد به PDF"
          >
            <Printer className="w-4 h-4 text-red-400" />
            <span>تبدیل به PDF</span>
          </button>

          {/* Range Delete Button */}
          <button
            onClick={openRangeDeleteModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition-colors cursor-pointer"
            title="حذف بر اساس بازه شماره ردیف"
          >
            <Trash2 className="w-4 h-4" />
            <span>حذف بازه‌ای</span>
          </button>

          {/* Delete All Button */}
          <button
            onClick={openAllDeleteModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            title="حذف تمامی کالاها"
          >
            <span>حذف همه</span>
          </button>
        </div>
      </div>

      {/* Floating Selected Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 px-5 shadow-lg border-2 border-red-600 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-bold">
              تعداد <strong className="text-red-400 font-black">{toPersianDigits(selectedIds.length)}</strong> کالا انتخاب شده است
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-red-400" />
              <span>چاپ موارد انتخابی</span>
            </button>
            <button
              onClick={openSelectedDeleteModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف این موارد</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg bg-transparent hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
            >
              لغو انتخاب
            </button>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold border-b border-slate-800">
                {/* Select All Checkbox */}
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded-sm border-slate-700 focus:ring-red-500 cursor-pointer"
                    aria-label="انتخاب همه ردیف‌های صفحه"
                  />
                </th>

                {/* Columns */}
                <th className="py-3.5 px-3 w-16 text-center text-slate-300 font-extrabold">شماره</th>
                <th className="py-3.5 px-4 text-slate-100 min-w-[200px]">نام محصول</th>
                <th className="py-3.5 px-4 text-slate-100 min-w-[120px]">برند</th>
                <th className="py-3.5 px-4 text-slate-100 min-w-[160px]">{siteCodeColumnTitle}</th>
                <th className="py-3.5 px-4 text-center min-w-[100px]">لینک</th>
                <th className="py-3.5 px-4 text-center min-w-[110px]">تاریخ</th>
                <th className="py-3.5 px-4 min-w-[240px]">توضیحات کامل</th>
                <th className="py-3.5 px-4 text-center w-28">عملیات</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                /* Skeleton rows */
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-3 text-center">
                      <div className="w-6 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-36 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-20 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-24 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-8 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-16 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-48 h-4 bg-slate-200 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-14 h-4 bg-slate-200 rounded mx-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center text-slate-500">
                      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-100 shadow-inner">
                        <FileSpreadsheet className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-base text-slate-800 mb-1">
                        هنوز کالایی ثبت نشده است.
                      </h3>
                      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                        جهت افزودن اولین مورد به جدول، از دکمه زیر استفاده نمایید.
                      </p>
                      <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
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
                      <tr className="bg-slate-100/90 border-y border-slate-300">
                        <td colSpan={9} className="py-2.5 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={allGroupSelected}
                                onChange={handleToggleGroupSelection}
                                className="w-4 h-4 text-red-600 rounded-sm border-slate-400 focus:ring-red-500 cursor-pointer"
                                title={`انتخاب تمام کالاهای ماه ${group.label}`}
                              />
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-600" />
                                <span className="font-black text-sm text-slate-900">
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
                              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
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

                      {/* Month Rows */}
                      {!isCollapsed && group.items.map(renderRow)}
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
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
        }}
        type={type}
        productToEdit={productToEdit}
        onSuccess={onRefresh}
      />

      <DeleteModal
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

      <DescriptionModal
        isOpen={Boolean(descriptionModalProduct)}
        onClose={() => setDescriptionModalProduct(null)}
        product={descriptionModalProduct}
        siteCodeLabel={siteCodeColumnTitle}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        type={type}
        totalTableItems={pagination.totalItems}
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
      />
    </div>
  );
}
