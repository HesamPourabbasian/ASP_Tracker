const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Dust Boot Tracks (tracks/گردگیر.csv) for 16th of Mehr (1405/07/16) ---');

  const pyCode = `
import csv, re, json

def extract_table_brand(desc):
    if not desc:
        return ''
    table_m = re.search(r'<table.*?</table>', desc, re.DOTALL)
    if not table_m:
        return ''
    table = table_m.group(0)
    m = re.search(r'(?:برند|برند سازنده|برند معتبر)\\s*</td>.*?<td[^>]*>(?:<strong[^>]*>)?(?:<span[^>]*>)?([^<]+)', table, re.DOTALL)
    if m:
        return re.sub(r'<[^>]+>', '', m.group(1)).strip()
    return ''

with open('tracks/گردگیر.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

items = []
for r in rows:
    id_ = r['شناسه']
    name = r['نام'].strip()
    sku = r['شناسه محصول'].strip()
    desc = r.get('توضیحات', '') or ''
    tb = extract_table_brand(desc)
    b_col = r.get('برندها', '').strip()
    raw_brand = b_col or tb
    brand = 'PYA' if ('pya' in (raw_brand or '').lower() or 'pya' in name.lower()) else (raw_brand or 'PYA')
    direction = 'مهر'
    if 'چپ' in name:
        direction = 'چپ'
    elif 'راست' in name:
        direction = 'راست'
    items.append({
        'productName': name,
        'brand': brand,
        'correctedSiteCode': sku,
        'link': f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit',
        'date': '1405/07/16',
        'description': direction,
        '_orig_id': id_
    })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync('python3', { input: pyCode, encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from tracks/گردگیر.csv.`);

  const baseTime = Date.now();
  const createdRecords = [];

  // Insert in reverse order with timestamp offsets so that descending order in UI preserves CSV order
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    const offset = (items.length - 1 - i) * 50;
    const createdAt = new Date(baseTime + offset);

    const record = await prisma.correctedProduct.create({
      data: {
        productName: item.productName,
        brand: item.brand,
        correctedSiteCode: item.correctedSiteCode,
        link: item.link,
        date: item.date,
        description: item.description,
        createdAt: createdAt,
        updatedAt: createdAt,
      },
    });
    createdRecords.unshift(record);
  }

  console.log(`Successfully created ${createdRecords.length} records!`);
  console.log('\nCreated records summary:');
  createdRecords.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.id}] [${r.brand}] ${r.productName} | ${r.correctedSiteCode} | ${r.description} | ${r.date} | ${r.link}`);
  });
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
