import { z } from 'zod';

export const productFormSchema = z.object({
  productName: z.string().min(1, 'نام محصول الزامی است').trim(),
  brand: z.string().min(1, 'برند الزامی است').trim(),
  siteCode: z.string().min(1, 'کد سایت الزامی است').trim(),
  link: z.string().url('لینک نامعتبر است').optional().or(z.literal('')),
  date: z.string().min(1, 'تاریخ الزامی است'),
  description: z.string().min(1, 'توضیحات الزامی است').trim(),
});

export type ProductFormSchemaType = z.infer<typeof productFormSchema>;
