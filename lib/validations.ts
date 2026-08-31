import { z } from 'zod';
import { normalizeJalaliDate, isValidJalaliDate } from './date-utils';

export const productFormSchema = z.object({
  productName: z
    .string()
    .trim()
    .min(1, { message: 'وارد کردن نام محصول الزامی است.' })
    .max(255, { message: 'نام محصول نمی‌تواند بیش از ۲۵۵ کاراکتر باشد.' }),
  brand: z
    .string()
    .trim()
    .min(1, { message: 'وارد کردن برند الزامی است.' })
    .max(100, { message: 'نام برند نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.' }),
  siteCode: z
    .string()
    .trim()
    .min(1, { message: 'وارد کردن کد سایت الزامی است.' })
    .max(100, { message: 'کد سایت نمی‌تواند بیش از ۱۰۰ کاراکتر باشد.' }),
  link: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try {
          // Check if valid URL or valid domain
          const urlToTest = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
          new URL(urlToTest);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'فرمت لینک نامعتبر است.' }
    ),
  date: z
    .string()
    .trim()
    .min(1, { message: 'انتخاب تاریخ الزامی است.' })
    .refine(
      (val) => {
        if (!val) return false;
        const normalized = normalizeJalaliDate(val);
        return isValidJalaliDate(normalized);
      },
      { message: 'تاریخ شمسی وارد شده معتبر نیست (فرمت صحیح: 1403/06/10).' }
    ),
  description: z
    .string()
    .trim()
    .min(1, { message: 'وارد کردن توضیحات کامل الزامی است.' }),
});

export const bulkDeleteSchema = z.object({
  all: z.boolean().optional(),
  ids: z.array(z.string()).optional(),
  fromRow: z.number().int().positive().optional(),
  toRow: z.number().int().positive().optional(),
});
