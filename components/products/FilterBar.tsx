'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  availableBrands: string[];
  onReset: () => void;
}

export function FilterBar({
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="جستجو در نام محصول، برند یا کد سایت..."
          className="w-full pr-10 pl-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
        />
      </div>
    </div>
  );
}
