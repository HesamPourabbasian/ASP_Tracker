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
