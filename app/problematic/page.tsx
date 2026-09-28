'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StatsBar from '@/components/common/StatsBar';
import MonthlyStatsBar from '@/components/common/MonthlyStatsBar';
import FilterBar from '@/components/products/FilterBar';
import IranianMonthTabs from '@/components/products/IranianMonthTabs';
import ProductTable from '@/components/products/ProductTable';
import Pagination from '@/components/products/Pagination';
import { UnifiedProduct, PaginationInfo, IranianMonthOption, MonthlyBreakdownItem } from '@/lib/types';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { toPersianDigits } from '@/lib/date-utils';

export default function ProblematicProductsPage() {
  const [items, setItems] = useState<UnifiedProduct[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<IranianMonthOption[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [pageSize, setPageSize] = useState(20);

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
          if (json.data.monthlyBreakdown) {
            setMonthlyBreakdown(json.data.monthlyBreakdown);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  // Fetch table data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
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

      const res = await fetch(`/api/problematic?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setItems(json.data.items || []);
        setPagination(json.data.pagination);
        setAvailableBrands(json.data.availableBrands || []);
        if (json.data.availableMonths) {
          setAvailableMonths(json.data.availableMonths);
        }
      }
    } catch (err) {
      console.error('Error loading problematic products:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, brand, month, year, hasLink, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [fetchData]);

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
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 text-red-600 flex items-center justify-center shadow-xs">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              کالاهای مشکل‌دار
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              فهرست قطعات و محصولاتی که نیازمند تصحیح کد یا بررسی فنی هستند
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            fetchData();
            fetchStats();
          }}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition-all shadow-2xs hover:bg-slate-50 cursor-pointer"
          title="بروزرسانی جدول"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-red-600 ${loading ? 'animate-spin' : ''}`} />
          <span>بروزرسانی داده‌ها</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <StatsBar
        problematicCount={stats.problematicCount}
        correctedCount={stats.correctedCount}
        activeType="problematic"
      />

      {/* Monthly Breakdown Analytics Bar */}
      <MonthlyStatsBar
        monthlyBreakdown={monthlyBreakdown}
        selectedMonth={month}
        onSelectMonth={(m) => {
          setMonth(m);
          setPage(1);
        }}
        activeType="problematic"
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
        totalAllCount={stats.problematicCount}
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
        availableMonths={availableMonths}
        onReset={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Main Table */}
      <ProductTable
        type="problematic"
        items={items}
        pagination={pagination}
        loading={loading}
        onRefresh={() => {
          fetchData();
          fetchStats();
        }}
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
