import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleProblematicProducts = [
  {
    productName: 'سرور HP ProLiant DL380 Gen10',
    brand: 'HP',
    existingSiteCode: 'HPE-DL380-G10-001',
    link: 'https://example.com/hpe-dl380',
    date: '1403/05/12',
    description: 'عدم تطابق شماره سریال منبع تغذیه با مشخصات فاکتور و مغایرت رم 32 گیگابایت با سفارش ثبت شده.',
  },
  {
    productName: 'سوئیچ سیسکو Cisco Catalyst 2960-X',
    brand: 'Cisco',
    existingSiteCode: 'CSCO-2960X-48TS',
    link: 'https://example.com/cisco-2960',
    date: '1403/05/15',
    description: 'پورت‌های 12 تا 16 دارای افت سیگنال بوده و فریم ویر دستگاه نیاز به بروزرسانی امنیتی دارد.',
  },
  {
    productName: 'روتر میکروتیک MikroTik RB4011',
    brand: 'MikroTik',
    existingSiteCode: 'MKT-RB4011-GS',
    link: 'https://example.com/mikrotik-4011',
    date: '1403/05/18',
    description: 'مشکل حرارتی در چیپست وای‌فای و قطعی مکرر اینترفیس SFP+ هنگام بارگذاری سنگین.',
  },
];

const sampleCorrectedProducts = [
  {
    productName: 'سرور Dell PowerEdge R740',
    brand: 'Dell',
    correctedSiteCode: 'DELL-R740-CORR-01',
    link: 'https://example.com/dell-r740',
    date: '1403/05/20',
    description: 'تعویض کارت رید کنترلر PERC H730P و تست کامل کش 2 گیگابایتی، کلیه تست‌های پایداری پاس شدند.',
  },
  {
    productName: 'فایروال فورتی‌نت FortiGate 60F',
    brand: 'Fortinet',
    correctedSiteCode: 'FG-60F-REV2',
    link: 'https://example.com/fortigate-60f',
    date: '1403/05/22',
    description: 'ارتقا فریمور به نگارش 7.2.5 و بازنشانی تنظیمات پیش‌فرض کارخانه، تست ترافیک با موفقیت انجام شد.',
  },
];

async function main() {
  console.log('Seeding problematic products...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
