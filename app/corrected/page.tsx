'use client';

import React, { useState, useEffect } from 'react';
import StatsBar from '@/components/common/StatsBar';
import MonthlyStatsBar from '@/components/common/MonthlyStatsBar';
import FilterBar from '@/components/products/FilterBar';
import IranianMonthTabs from '@/components/products/IranianMonthTabs';
import ProductTable from '@/components/products/ProductTable';
import Pagination from '@/components/products/Pagination';
import { UnifiedProduct, PaginationInfo, IranianMonthOption, MonthlyBreakdownItem } from '@/lib/types';
import { CheckCircle2, RefreshCw } from 'lucide-react';

export default function CorrectedProductsPage() {
  const [items, setItems] = useState<UnifiedProduct[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<IranianMonthOption[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState<{ problematicCount: number; correctedCount: number }>({
    problematicCount: 0,
    correctedCount: 0,
  });

  // Filter & Pagination States
  const [search, setSearch] = useState('');
  const [brand, setBrand] = useState('all');
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [hasLink, setHasLink] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(600);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 600,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', String(pageSize));
        if (search.trim()) params.set('search', search.trim());
        if (brand && brand !== 'all') params.set('brand', brand);
        if (month && month !== 'all') params.set('month', month);
        if (year && year !== 'all') params.set('year', year);
        if (hasLink && hasLink !== 'all') params.set('hasLink', hasLink);
        params.set('sortBy', sortBy);
        params.set('sortOrder', sortOrder);

        const [res, statsRes] = await Promise.all([
          fetch(`/api/corrected?${params.toString()}`),
          fetch('/api/stats'),
        ]);

        const json = await res.json();
        if (res.ok && json.success && !ignore) {
          setItems(json.data.items || []);
          setPagination(json.data.pagination);
          setAvailableBrands(json.data.availableBrands || []);
          if (json.data.availableMonths) {
            setAvailableMonths(json.data.availableMonths);
          }
        }

        const statsJson = await statsRes.json();
        if (statsRes.ok && statsJson.success && !ignore) {
          setStats(statsJson.data);
          if (statsJson.data.monthlyBreakdown) {
            setMonthlyBreakdown(statsJson.data.monthlyBreakdown);
          }
        }
      } catch (err) {
        console.error('Error loading corrected products:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [page, pageSize, search, brand, month, year, hasLink, sortBy, sortOrder, refreshTrigger]);

  const onRefresh = () => setRefreshTrigger((prev) => prev + 1);

  const handleResetFilters = () => {
    setSearch('');
    setBrand('all');
    setMonth('all');
    setYear('all');
    setHasLink('all');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  const isFiltered =
    Boolean(search) ||
    brand !== 'all' ||
    month !== 'all' ||
    year !== 'all' ||
    hasLink !== 'all' ||
    sortBy !== 'date' ||
    sortOrder !== 'desc';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              تصحیح شده توسط من
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
              آرشیو قطعات و اقلامی که کدهای فنی آنها با موفقیت بازبینی و اصلاح شده‌اند
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
          title="بروزرسانی جدول"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <StatsBar
        problematicCount={stats.problematicCount}
        correctedCount={stats.correctedCount}
        activeType="corrected"
      />

      {/* Monthly Breakdown Analytics Bar */}
      <MonthlyStatsBar
        monthlyBreakdown={monthlyBreakdown}
        selectedMonth={month}
        onSelectMonth={(m) => {
          setMonth(m);
          setPage(1);
        }}
        activeType="corrected"
      />

      {/* Iranian Month Navigation Tabs */}
      <IranianMonthTabs
        selectedMonth={month}
        onSelectMonth={(m) => {
          setMonth(m);
          setPage(1);
        }}
        selectedYear={year}
        onSelectYear={(y) => {
          setYear(y);
          setPage(1);
        }}
        availableMonths={availableMonths}
        totalAllCount={stats.correctedCount}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        brand={brand}
        onBrandChange={(b) => {
          setBrand(b);
          setPage(1);
        }}
        month={month}
        onMonthChange={(m) => {
          setMonth(m);
          setPage(1);
        }}
        hasLink={hasLink}
        onHasLinkChange={(l) => {
          setHasLink(l);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortByChange={(s) => {
          setSortBy(s);
          setPage(1);
        }}
        sortOrder={sortOrder}
        onSortOrderToggle={() =>
          setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        }
        availableBrands={availableBrands}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Main Table */}
      <ProductTable
        type="corrected"
        items={items}
        pagination={pagination}
        loading={loading}
        onRefresh={onRefresh}
      />

      {/* Pagination Controls */}
      <Pagination
        pagination={pagination}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(ps) => {
          setPageSize(ps);
          setPage(1);
        }}
      />
    </div>
  );
}
