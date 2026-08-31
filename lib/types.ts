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
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductListResponse {
  items: UnifiedProduct[];
  pagination: PaginationInfo;
  availableBrands: string[];
}

export interface StatsResponse {
  problematicCount: number;
  correctedCount: number;
  totalCount: number;
}

export interface ProductFormData {
  productName: string;
  brand: string;
  siteCode: string;
  link?: string;
  date: string;
  description: string;
}
