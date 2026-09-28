<div align="center">

# 📦 سامانه جامع پیگیری و مدیریت محصولات ASP
### ASP Tracker — Enterprise Asset & Defective Product Management System

یک سامانه فول‌استک مدرن، سریع و کاملاً بومی‌سازی‌شده بر پایه **Next.js 16 (App Router)**، **TypeScript**، **Prisma ORM**، **PostgreSQL** و **Tailwind CSS 4** برای ردیابی، عیب‌یابی و مدیریت چرخه حیات تجهیزات و قطعات در شبکه سازمانی.

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📑 فهرست مطالب (Table of Contents)

- [🌟 قابلیت‌ها و ویژگی‌های کلیدی](#-قابلیت‌ها-و-ویژگی‌های-کلیدی)
- [🏗️ معماری و جریان داده‌ها (System Architecture)](#️-معماری-و-جریان-داده‌ها-system-architecture)
- [🛠️ پشته فناوری (Tech Stack)](#️-پشته-فناوری-tech-stack)
- [🗄️ مدل داده و پایگاه‌داده (Database Schema)](#️-مدل-داده-و-پایگاه‌داده-database-schema)
- [📡 مستندات وب‌سرویس‌ها (API Specifications)](#-مستندات-وب‌سرویس‌ها-api-specifications)
- [🚀 راهنمای نصب و راه‌اندازی (Getting Started)](#-راهنمای-نصب-و-راه‌اندازی-getting-started)
- [📂 ساختار پروژه (Project Structure)](#-ساختار-پروژه-project-structure)
- [📜 دستورات قابل اجرا (NPM Scripts)](#-دستورات-قابل-اجرا-npm-scripts)
- [👤 نویسنده و پشتیبانی](#-نویسنده-و-پشتیبانی)

---

## 🌟 قابلیت‌ها و ویژگی‌های کلیدی

### ۱. رابط کاربری کاملاً بومی و راست‌چین (Persian Native & RTL)
- طراحی اختصاصی بر پایه زبان فارسی و جهت چیدمان راست‌به‌چپ (`dir="rtl"`).
- تایپوگرافی خوانا با قلم پرطرفدار **وزیرمتن (Vazirmatn)**.
- تبدیل بلادرنگ و اتوماتیک اعداد انگلیسی به ارقام فارسی در تمامی جداول و کارت‌های آماری.
- محاسبات و نمایش تاریخ‌ها به تقویم **هجری خورشیدی (جلالی)** به کمک هسته بهینه‌شده `jalaali-js`.

### ۲. پیشخوان هوش تجاری و KPIهای زنده (Executive KPI Dashboard)
- کارت‌های خلاصه وضعیت شامل: **مجموع رکوردها**، **تعداد دارای نقص**، **تعداد اصلاح‌شده** و **نرخ تفکیک**.
- دسترسی سریع به عملیات پرکاربرد، لینک‌های پرینت و کلیدهای افزودن سریع داده‌ها.

### ۳. مدیریت چرخه حیات اقلام دارای نقص (Problematic Products)
- فرم ثبت جامع مشخصات: نام قطعه، نام برند، کد اختصاصی سایت، لینک پیوست، تاریخ شمسی و توضیحات فنی نقص.
- جدول هوشمند با قابلیت مرتب‌سازی ستونی، چک‌باکس انتخاب سطرها و نوار عملیات دسته‌ای شناور.
- مودال مشاهده متن کامل توضیحات همراه با افکت پس‌زمینه بلور (`Backdrop Blur`).

### ۴. رهگیری و مستندسازی اقلام اصلاح‌شده (Corrected Products)
- ثبت اطلاعات اصلاحات، کدهای سایت نهایی و گزارش عیب‌یابی انجام‌شده.
- امکان انتقال مستقیم اقلام از لیست معیوب به لیست اصلاح‌شده.

### ۵. موتور جستجو و فیلتراسیون هوشمند (Smart Filtering)
- فیلد جستجوی زنده در نام محصول، برند، کد سایت و محتوای توضیحات بدون ایجاد بار پردازشی اضافه (Debounced Search).
- فیلتر آبشاری بر اساس برندهای موجود در پایگاه‌داده به صورت خودکار و داینامیک.
- امکان بازنشانی سریع تمام فیلترها با یک کلیک.

### ۶. سامانه حذف پیشرفته و امن (Smart & Safe Deletion)
- پشتیبانی از **حذف تکی** همراه با پاپ‌آپ تاییدیه.
- پشتیبانی از **حذف بازه‌ای با شماره ردیف** (به عنوان مثال حذف ردیف‌های ۵ تا ۱۲).
- پشتیبانی از **حذف انتخابی دسته‌ای** (Bulk Deletion) یا حذف یکپارچه با تمهیدات حفاظتی جلوگیری از خطای انسانی.

### ۷. موتور چاپ و خروجی PDF اختصاصی (Dedicated Print & PDF Engine)
- صفحه اختصاصی رندرینگ چاپی با استایل‌های مهندسی‌شده `@media print`.
- مودال انتخاب ستون‌های دلخواه قبل از ارسال به چاپگر یا ذخیره به عنوان PDF.
- تنظیمات سایز و جهت صفحه (افقی / عمودی) و حذف حاشیه‌های مزاحم رابط کاربری در برگه خروجی.

### ۸. سیستم اعلانات سبک و اختصاصی (Custom Toast Notifications)
- ارائه‌دهنده Toast مستقل بر پایه React Context بدون اضافه کردن بسته‌های سنگین خارجی.
- انیمیشن‌های نرم ورود و خروج، رنگ‌بندی تفکیک‌شده برای حالت‌های موفقیت، خطا، هشدار و پیام‌های راهنما.

### ۹. سامانه تفکیک ماهانه بر پایه گاه‌شمار هجری خورشیدی (Iranian Month Division System)
- **نوار ناوبری ۱۲ ماه سال شمسی (`IranianMonthTabs`)**: تب‌های اختصاصی از فروردین تا اسفند همراه با شمارنده زنده تعداد کالاها، انتخاب سال شمسی و دکمه پرش به ماه جاری.
- **نمودار و کارت‌های توزیع ماهانه (`MonthlyStatsBar`)**: نمایش توزیع فراوانی کالاها و سهم هر ماه با قابلیت فیلتر مستقیم با یک کلیک.
- **تفکیک سطرهای جدول به بخش‌های ماهانه (`Grouped by Iranian Month`)**: کلید تغییر نحوه نمایش جدول بین حالت یکپارچه و حالت دسته‌بندی‌شده به تفکیک ماه‌های شمسی با هدرهای مستقل، شمارنده و قابلیت بستن/باز کردن سطرها.
- **خروجی چاپی و PDF ماهانه**: امکان تولید گزارش رسمی چاپی کاتالوگ به صورت تفکیک‌شده برای هر ماه شمسی.

---

## 🏗️ معماری و جریان داده‌ها (System Architecture)

```mermaid
graph TD
    A[کاربر / مرورگر Client] -->|درخواست صفحات| B[Next.js App Router]
    B --> C[کامپوننت‌های رابط کاربری Client/Server Components]
    C -->|فراخوانی REST API| D[Next.js Route Handlers /api/*]
    D -->|اعتبارسنجی ورودی‌ها| E[Zod Schema Validator]
    E -->|درخواست داده| F[Prisma ORM Client Singleton]
    F -->|پرس‌وجوی بهینه| G[(پایگاه‌داده PostgreSQL)]
    G -->|نتیجه ایندکس‌شده| F
    F -->|پاسخ JSON| D
    D -->|به‌روزرسانی State| C
    C -->|نمایش داده با تقویم جلالی| A
```

---

## 🛠️ پشته فناوری (Tech Stack)

| لایه | فناوری | توضیحات |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) | فریم‌ورک مدرن فول‌استک ری‌اکت |
| **UI Library** | React 19 | نسخه پایدار ری‌اکت با Server Components |
| **Language** | TypeScript 5 | تایپ‌سیف بودن ۱۰۰ درصدی تمام کامپوننت‌ها و APIها |
| **Styling** | Tailwind CSS 4 | ابزار کلاس‌های یوتیلیتی نسل چهارم |
| **Icons** | Lucide React | مجموعه آیکون‌های مدرن، یکپارچه و بهینه |
| **Database** | PostgreSQL | دیتابیس رابطه‌ای امن و قدرتمند با قابلیت اسکیل |
| **ORM** | Prisma 5.22 | ابزار پیشرفته مدیریت دیتابیس و مهاجرت‌ها |
| **Validation** | Zod 4 | اعتبارسنجی دقیق داده‌های ورودی کلاینت و سرور |
| **Date & Calendar** | Jalaali-js | پردازش و تبدیل دقیق تاریخ شمسی/میلادی |

---

## 🗄️ مدل داده و پایگاه‌داده (Database Schema)

سامانه از دو مدل اصلی در پایگاه‌داده PostgreSQL استفاده می‌کند:

### ۱. جدول اقلام دارای ایراد (`ProblematicProduct`)
| ستون | نوع داده | کلید / ایندکس | توضیحات |
| :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key | شناسه منحصر‌به‌فرد |
| `productName` | String | Index | نام و مدل سخت‌افزار یا کالا |
| `brand` | String | Index | شرکت یا برند سازنده |
| `existingSiteCode` | String | Index | کد رهگیری یا شناسه سایت مربوطه |
| `link` | String? | اختیاری | آدرس وب پیوست یا لینک بررسی |
| `date` | String | - | تاریخ ثبت اولیه (شمسی) |
| `description` | Text | - | شرح تفصیلی عیوب و گزارش تکنسین |
| `createdAt` | DateTime | Index | زمان ایجاد در پایگاه‌داده |
| `updatedAt` | DateTime | - | زمان آخرین به‌روزرسانی |

### ۲. جدول اقلام اصلاح‌شده (`CorrectedProduct`)
| ستون | نوع داده | کلید / ایندکس | توضیحات |
| :--- | :--- | :--- | :--- |
| `id` | String (CUID) | Primary Key | شناسه منحصر‌به‌فرد |
| `productName` | String | Index | نام و مدل سخت‌افزار |
| `brand` | String | Index | شرکت یا برند سازنده |
| `correctedSiteCode`| String | Index | کد رهگیری نهایی پس از اصلاح |
| `link` | String? | اختیاری | آدرس لینک گزارش رفع اشکال |
| `date` | String | - | تاریخ رفع عیب و نهایی‌سازی (شمسی) |
| `description` | Text | - | اقدامات فنی انجام‌شده و تست‌های انجام یافته |
| `createdAt` | DateTime | Index | زمان ثبت نهایی |
| `updatedAt` | DateTime | - | زمان آخرین به‌روزرسانی |

---

## 📡 مستندات وب‌سرویس‌ها (API Specifications)

### آمار و پیشخوان
- `GET /api/stats`: دریافت تعداد اقلام معیوب، اصلاح‌شده، مجموع کل و توزیع ماهانه کالاها در فیلد `monthlyBreakdown` بر اساس تقویم شمسی.

### اقلام دارای نقص (Problematic Products)
- `GET /api/problematic`: دریافت لیست اقلام با قابلیت صفحه‌بندی (`page`, `pageSize`)، جستجو (`search`)، فیلتر برند (`brand`) و فیلتر تفکیک ماهانه شمسی (`month`, `year`). بازگردانی لیست ماه‌های موجود در `availableMonths`.
- `POST /api/problematic`: ثبت یک محصول دارای نقص جدید (همراه با اعتبارسنجی Zod).
- `GET /api/problematic/[id]`: دریافت مشخصات جزئی یک قلم بر اساس شناسه.
- `PUT /api/problematic/[id]`: ویرایش و به‌روزرسانی اطلاعات یک قلم.
- `DELETE /api/problematic/[id]`: حذف تکی یا حذف بازه‌ای بر اساس شماره ردیف‌ها.

### اقلام اصلاح‌شده (Corrected Products)
- `GET /api/corrected`: دریافت لیست اقلام اصلاح‌شده با صفحه‌بندی، فیلتر برند و فیلتر تفکیک ماهانه شمسی (`month`, `year`). بازگردانی `availableMonths`.
- `POST /api/corrected`: ثبت یک قلم اصلاح‌شده جدید.
- `GET /api/corrected/[id]`: دریافت اطلاعات قلم اصلاح‌شده.
- `PUT /api/corrected/[id]`: ویرایش قلم اصلاح‌شده.
- `DELETE /api/corrected/[id]`: حذف قلم از لیست اصلاح‌شده.

---

## 🚀 راهنمای نصب و راه‌اندازی (Getting Started)

### پیش‌نیازها
- **Node.js** نسخه `18.18.0` یا جدیدتر
- **PostgreSQL** در حال اجرا (محلی یا ابری)

### مراحل گام‌به‌گام

#### ۱. کلون کردن مخزن گیت
```bash
git clone https://github.com/HesamPourabbasian/ASP_Tracker.git
cd ASP_Tracker
```

#### ۲. نصب پکیج‌ها
```bash
npm install
```

#### ۳. تنظیمات متغیرهای محیطی
یک کپی از فایل `.env.example` با نام `.env` بسازید:
```bash
cp .env.example .env
```
و رشته اتصال دیتابیس خود را درون فایل `.env` وارد کنید:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/asp_tracker?schema=public"
```

#### ۴. اعمال ساختار جداول و سید داده‌های نمونه
```bash
# ایجاد جداول و ایندکس‌ها در دیتابیس
npx prisma db push

# پر کردن دیتابیس با داده‌های نمونه واقعی فارسی
npx tsx prisma/seed.ts
```

#### ۵. اجرای پروژه در محیط توسعه
```bash
npm run dev
```
سامانه بر روی پورت `3005` اجرا شده و در آدرس زیر در دسترس خواهد بود:  
👉 **[http://localhost:3005](http://localhost:3005)**

---

## 📂 ساختار پروژه (Project Structure)

```text
ASP-Tracker/
├── app/
│   ├── api/
│   │   ├── problematic/
│   │   │   ├── route.ts              # لیست و ایجاد محصولات دارای نقص
│   │   │   └── [id]/route.ts         # ویرایش، نمایش و حذف تکی/بازه‌ای
│   │   ├── corrected/
│   │   │   ├── route.ts              # لیست و ایجاد محصولات اصلاح‌شده
│   │   │   └── [id]/route.ts         # ویرایش و حذف محصولات اصلاح‌شده
│   │   └── stats/
│   │       └── route.ts              # وب‌سرویس محاسبه آمار KPI
│   ├── problematic/page.tsx          # صفحه مدیریت محصولات معیوب
│   ├── corrected/page.tsx            # صفحه مدیریت محصولات اصلاح‌شده
│   ├── print/page.tsx                # صفحه اختصاصی پیش‌نمایش چاپ و خروجی PDF
│   ├── globals.css                   # استایل‌های سراسری، پالت رنگی و CSS پرینت
│   ├── layout.tsx                    # قالب اصلی برنامه با فونت وزیرمتن و RTL
│   └── page.tsx                      # صفحه اصلی و پیشخوان مانیتورینگ
├── components/
│   ├── common/
│   │   ├── Header.tsx                # ناوبری اصلی و کلیدهای دسترسی سریع
│   │   └── StatsBar.tsx              # نوار کارت‌های آماری شاخص‌های عملکرد
│   ├── products/
│   │   ├── ProductTable.tsx          # جدول پیشرفته با قابلیت سورت و انتخاب
│   │   ├── FilterBar.tsx             # نوار جستجو و فیلتر برند
│   │   ├── Pagination.tsx            # صفحه‌بندی با ارقام و دکمه‌های فارسی
│   │   ├── ProductModal.tsx          # مودال فرم ایجاد و ویرایش
│   │   ├── DeleteModal.tsx           # مودال تایید حذف تکی، بازه‌ای و گروهی
│   │   ├── DescriptionModal.tsx      # مودال مطالعه جزئیات و شرح نقص
│   │   └── PdfExportModal.tsx        # مودال تنظیمات چاپ و دانلود PDF
│   └── ui/
│       └── ToastContext.tsx          # سیستم اعلانات و پیام‌های بازخورد
├── lib/
│   ├── date-utils.ts                 # ابزارهای تقویم جلالی و ارقام فارسی
│   ├── prisma.ts                     # نمونه یکتا و Singleton کلاینت پریزما
│   ├── types.ts                      # تعاریف تایپ‌های داده و اینترفیس‌ها
│   └── validations.ts                # اسکیماهای اعتبارسنجی Zod
├── prisma/
│   ├── schema.prisma                 # تعاریف ساختار و ایندکس‌های دیتابیس
│   └── seed.ts                       # اسکریپت تولید داده‌های آزمایشی
├── .env.example                      # قالب پیکربندی متغیرهای محیطی
├── package.json                      # مشخصات پکیج و اسکریپت‌ها
└── tsconfig.json                     # تنظیمات کامپایلر تایپ‌اسکریپت
```

---

## 📜 دستورات قابل اجرا (NPM Scripts)

| دستور | توضیحات |
| :--- | :--- |
| `npm run dev` | اجرای سرور محلی توسعه بر روی پورت اختصاصی `3005` |
| `npm run build` | بیلد بهینه‌شده پروژه جهت استقرار در محیط پروداکشن |
| `npm run start` | اجرای سرور آماده به کار پروداکشن |
| `npm run lint` | اجرای اعتبارسنجی کدها با ESLint |

---

## 👤 نویسنده و پشتیبانی

طراحی و توسعه یافته با ❤️ توسط **[حسام پورعباسیان (Hesam Pourabbasian)](https://github.com/HesamPourabbasian)**.

- **گیت‌هاب**: [@HesamPourabbasian](https://github.com/HesamPourabbasian)
- **پروژه**: [ASP_Tracker](https://github.com/HesamPourabbasian/ASP_Tracker)

اگر این پروژه برای شما مفید بود، لطفاً با ثبت یک ستاره (⭐️) در گیت‌هاب از آن حمایت کنید!
