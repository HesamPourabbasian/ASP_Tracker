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
