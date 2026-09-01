'use client';

import React from 'react';
import { UnifiedProduct } from '@/lib/types';

interface ProductTableProps {
  items: UnifiedProduct[];
  isLoading?: boolean;
}

export function ProductTable({ items, isLoading }: ProductTableProps) {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">در حال بارگذاری اطلاعات...</div>;
  }

  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm text-right">
        <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="py-3.5 px-4">ردیف</th>
            <th className="py-3.5 px-4">نام محصول</th>
            <th className="py-3.5 px-4">برند</th>
            <th className="py-3.5 px-4">کد سایت</th>
            <th className="py-3.5 px-4">تاریخ</th>
            <th className="py-3.5 px-4">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-3.5 px-4">{item.rowNumber}</td>
              <td className="py-3.5 px-4 font-medium">{item.productName}</td>
              <td className="py-3.5 px-4">{item.brand}</td>
              <td className="py-3.5 px-4 font-mono">{item.siteCode}</td>
              <td className="py-3.5 px-4">{item.date}</td>
              <td className="py-3.5 px-4">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
