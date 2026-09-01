'use client';

import React from 'react';
import { Trash2, X } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-red-600 mb-2">حذف آیتم</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">آیا از حذف این مورد اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg">انصراف</button>
          <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg">حذف</button>
        </div>
      </div>
    </div>
  );
}
