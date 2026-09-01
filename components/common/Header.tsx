'use client';

import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-slate-900 dark:text-white">سامانه پیگیری ASP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
