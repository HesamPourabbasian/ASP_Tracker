export interface ProblematicProduct {
  id: string;
  productName: string;
  brand: string;
  existingSiteCode: string;
  link: string | null;
  date: string;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  rowNumber?: number;
}

export interface CorrectedProduct {
  id: string;
  productName: string;
  brand: string;
  correctedSiteCode: string;
  link: string | null;
  date: string;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  rowNumber?: number;
}

export type ProductType = 'problematic' | 'corrected';

export interface UnifiedProduct {
  id: string;
  productName: string;
  brand: string;
  siteCode: string;
  link: string | null;
  date: string;
  description: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  rowNumber: number;
  monthRowNumber?: number;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IranianMonthOption {
  key: string;
  monthNumber: number;
  monthName: string;
  year?: string;
  label: string;
  count?: number;
}

export interface MonthlyTrackGroup<T> {
  year: string;
  month: string;
  monthNumber: number;
  monthName: string;
  yearMonthKey: string;
  label: string;
  items: T[];
  count: number;
}

export interface MonthlyBreakdownItem {
  yearMonthKey: string;
  year: string;
  month: string;
  monthNumber: number;
  monthName: string;
  label: string;
  problematicCount: number;
  correctedCount: number;
  totalCount: number;
}

export interface IranianMonthFilterParams {
  month?: string;
  year?: string;
}

export interface ProductListResponse {
  items: UnifiedProduct[];
  pagination: PaginationInfo;
  availableBrands: string[];
  availableMonths?: IranianMonthOption[];
}

export interface StatsResponse {
  problematicCount: number;
  correctedCount: number;
  totalCount: number;
  monthlyBreakdown?: MonthlyBreakdownItem[];
}

export interface ProductFormData {
  productName: string;
  brand: string;
  siteCode: string;
  link?: string;
  date: string;
  description: string;
}

export interface DeleteRangeRequest {
  fromRow: number;
  toRow: number;
}

export interface BulkDeleteRequest {
  ids?: string[];
  fromRow?: number;
  toRow?: number;
  all?: boolean;
}
