import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial ASP Tracker data...');

  await prisma.problematicProduct.deleteMany({});
  await prisma.correctedProduct.deleteMany({});

  const problematicData = [
    {
      productName: 'لنت ترمز جلو هیوندای آزرا گرنجور',
      brand: 'CTR',
      existingSiteCode: 'CTR-58101-3FA00',
      link: 'https://example.com/product/azera-front-brake',
      date: '1403/04/15',
      description: 'عدم تطابق کد فنی با مدل ۲۰۱۲، نیازمند اصلاح شماره به 58101-3FA10 و بررسی ضخامت لنت.',
    },
    {
      productName: 'طبق جلو راست کیا سراتو YD',
      brand: 'CTR',
      existingSiteCode: 'CQKH-31R',
      link: 'https://example.com/product/cerato-control-arm',
      date: '1403/04/28',
      description: 'بوش طبق در اطلاعات فنی سایت قید نشده است و مشتریان دچار ابهام می‌شوند.',
    },
    {
      productName: 'سیبک فرمان چپ هیوندای سانتافه DM',
      brand: 'CTR',
      existingSiteCode: 'CEKH-42L',
      link: 'https://example.com/product/santafe-tie-rod',
      date: '1403/05/05',
      description: 'تصویر محصول در سایت با قطعه فیزیکی مغایرت دارد، نیاز به جایگزینی تصویر اصلی CTR.',
    },
    {
      productName: 'میل موجگیر جلو تویوتا کرولا',
      brand: 'Genuine',
      existingSiteCode: '48820-02040',
      link: 'https://example.com/product/corolla-link',
      date: '1403/05/18',
      description: 'شماره فنی موجود در سایت ناقص درج شده و مدل‌های ۲۰۱۴ به بعد را پوشش نداده است.',
    },
    {
      productName: 'شمع موتور سوزنی ایریدیوم',
      brand: 'NGK',
      existingSiteCode: 'ILZKR7B-11',
      link: null,
      date: '1403/06/05',
      description: 'فاقد لینک صفحه در سایت، نیازمند ایجاد محصول در وب‌سایت و تخصیص کد انبار.',
    },
    {
      productName: 'فیلتر روغن کیا اپتیما TF',
      brand: 'Genuine',
      existingSiteCode: '26300-35505',
      link: 'https://example.com/product/optima-oil-filter',
      date: '1403/06/12',
      description: 'توضیحات کاتالوگ مربوط به مدل ۴ سیلندر ۲۴۰۰ سی‌سی است ولی در سایت ۶ سیلندر درج شده.',
    },
    {
      productName: 'دیسک ترمز چرخ عقب رنو تالیسمان',
      brand: 'CTR',
      existingSiteCode: '43200-1533R',
      link: 'https://example.com/product/talisman-rear-disc',
      date: '1403/06/24',
      description: 'مشخصات فنی شامل قطر خارجی ۲۹۰ میلی‌متر و بلبرینگ سر خود در جدول ویژگی‌ها نیامده است.',
    },
    {
      productName: 'لنت ترمز عقب تویوتا لندکروز V8',
      brand: 'CTR',
      existingSiteCode: '04466-60140',
      link: 'https://example.com/product/landcruiser-rear-brake',
      date: '1403/07/04',
      description: 'کد بارکد کالا در سامانه اشتباه تایپ شده و با لیبل روی جعبه همخوانی ندارد.',
    },
    {
      productName: 'سیبک طبق پایین مزدا ۳',
      brand: 'CTR',
      existingSiteCode: 'BBM2-34-300',
      link: 'https://example.com/product/mazda3-ball-joint',
      date: '1403/07/16',
      description: 'سازگاری با مزدا ۳ نیو در توضیحات ذکر نشده است در صورتی که قطعه مشترک است.',
    },
    {
      productName: 'تسمه دینام پژو ۲۰۶ تیپ ۵',
      brand: 'Dongil',
      existingSiteCode: '6PK1565',
      link: 'https://example.com/product/206-belt',
      date: '1403/08/02',
      description: 'سایز تسمه در عنوان ۶PK۱۵۶۰ خورده ولی در مشخصات ۶PK۱۵۶۵ است، نیاز به یکپارچه‌سازی.',
    },
    {
      productName: 'کمک فنر جلو چپ کیا اسپورتیج SL',
      brand: 'CTR',
      existingSiteCode: '54651-2S000',
      link: 'https://example.com/product/sportage-front-shock',
      date: '1403/08/11',
      description: 'زاویه پایه نگهدارنده سنسور ABS با مدل ۲۰۱۴ بررسی شود، ممکن است پارت نامبر متفاوتی باشد.',
    },
    {
      productName: 'وایر شمع تمام سیلیکون موتور EF7',
      brand: 'Genuine',
      existingSiteCode: '302010-EF7',
      link: null,
      date: '1403/08/25',
      description: 'مقاومت اهمی وایرها در جدول مشخصات وارد نشده است.',
    },
  ];

  const correctedData = [
    {
      productName: 'لنت ترمز جلو تویوتا کمری XV40',
      brand: 'CTR',
      correctedSiteCode: 'CTR-04465-33471',
      link: 'https://example.com/product/camry-front-brake',
      date: '1403/04/18',
      description: 'اصلاح کد فنی و ثبت کامل سازگاری با مدل‌های ۲۰۰۷ تا ۲۰۱۱ به همراه افزودن راهنمای نصب.',
    },
    {
      productName: 'سیبک فرمان راست کیا اپتیما JF',
      brand: 'CTR',
      correctedSiteCode: 'CEKH-39R',
      link: 'https://example.com/product/optima-jf-tie-rod',
      date: '1403/05/12',
      description: 'اصلاح عنوان کالا و قرار دادن جدول سازگاری دقیق با سراتو و اپتیما.',
    },
    {
      productName: 'طبق کامل چپ هیوندای توسان TL',
      brand: 'CTR',
      correctedSiteCode: 'CQKH-45L',
      link: 'https://example.com/product/tucson-control-arm',
      date: '1403/05/25',
      description: 'کد فنی تصحیح شد، اطلاعات بوش‌ها درج گردید و تصویر باکیفیت CTR جایگزین شد.',
    },
    {
      productName: 'بوش میل موجگیر جلو نیسان ماکسیما',
      brand: 'Genuine',
      correctedSiteCode: '54613-2Y001',
      link: 'https://example.com/product/maxima-stabilizer-bush',
      date: '1403/06/08',
      description: 'اصلاح سایز میله موجگیر از ۲۲ به ۲۴ میلی‌متر و ویرایش نام تجاری کالا.',
    },
    {
      productName: 'شمع ایریدیوم پایه بلند بوش',
      brand: 'Bosch',
      correctedSiteCode: 'FR7DC-PLUS',
      link: 'https://example.com/product/bosch-spark-plug',
      date: '1403/06/20',
      description: 'فیلر دهانه شمع به ۰.۹ میلی‌متر تصحیح شد و شماره آچار به ۱۶ تغییر یافت.',
    },
    {
      productName: 'واتر پمپ پژو ۴۰۵ و پارس XU7',
      brand: 'CTR',
      correctedSiteCode: 'CTR-WP-405',
      link: 'https://example.com/product/405-water-pump',
      date: '1403/07/11',
      description: 'کد کاتالوگ تصحیح گردید و واشر آب‌بندی در اقلام همراه ثبت شد.',
    },
    {
      productName: 'سنسور اکسیژن بالا رنو مگان ۲۰۰۰',
      brand: 'Bosch',
      correctedSiteCode: '0258006046',
      link: 'https://example.com/product/megane-o2-sensor',
      date: '1403/08/05',
      description: 'طول سوکت و سیم بررسی و کد تطبیقی بوش آلمان در فیلد اختصاصی وارد گردید.',
    },
  ];

  for (const item of problematicData) {
    await prisma.problematicProduct.create({ data: item });
  }

  for (const item of correctedData) {
    await prisma.correctedProduct.create({ data: item });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
