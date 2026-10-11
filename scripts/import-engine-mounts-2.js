const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Engine Mount Tracks (CSV 2) ---');

  const pyCode = `
import csv, re, json

with open('tracks/دسته موتور۲.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

parent_map = {r['شناسه']: r for r in rows if r['نوع'] == 'variable'}
variations_by_parent = {}
for r in rows:
    if r['نوع'] == 'variation':
        pid = r['مادر'].replace('id:', '').strip()
        variations_by_parent.setdefault(pid, []).append(r)

def normalize_brand(b):
    b = b.strip()
    if b.lower() == 'cariso tech':
        return 'Cariso Tech'
    if b.lower() == 'genuine':
        return 'Genuine'
    if b.upper() == 'PH':
        return 'PH'
    if b.upper() == 'GY':
        return 'GY'
    if b.lower() == 'korea':
        return 'Korea'
    if b.upper() == 'SH':
        return 'SH'
    return b

items = []
for r in rows:
    t = r['نوع']
    id_ = r['شناسه']
    if t == 'simple':
        name = r['نام'].strip()
        sku = r['شناسه محصول'].strip()
        desc = r['توضیحات'] or ''
        table_m = re.search(r'<table.*?</table>', desc, re.DOTALL)
        if table_m:
            table = table_m.group(0)
            m = re.search(r'برند\s*</td>.*?<td[^>]*>(?:<span[^>]*>)?([^<]+)', table, re.DOTALL)
            raw_brand = m.group(1).strip() if m else 'Cariso Tech'
        else:
            raw_brand = 'Cariso Tech'
        brand = normalize_brand(raw_brand)
        link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
        items.append({
            'productName': name,
            'brand': brand,
            'correctedSiteCode': sku,
            'link': link,
            'date': '1405/06/02',
            'description': 'شهریور',
            '_orig_id': id_
        })
    elif t == 'variable':
        vars_ = variations_by_parent.get(id_, [])
        base_name = r['نام'].strip()
        for v in vars_:
            v_sku = v['شناسه محصول'].strip()
            raw_v_brand = v.get('مقدار(های) 1 صفت', '').strip()
            v_brand = normalize_brand(raw_v_brand)
            v_link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
            items.append({
                'productName': base_name,
                'brand': v_brand,
                'correctedSiteCode': v_sku,
                'link': v_link,
                'date': '1405/06/02',
                'description': 'شهریور',
                '_orig_id': v['شناسه'],
                '_parent_id': id_
            })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync(`python3 -c "${pyCode.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from دسته موتور۲.csv.`);

  const baseTime = Date.now();
  const createdRecords = [];

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
  console.log('\nSample created records:');
  createdRecords.slice(0, 5).forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.id}] [${r.brand}] ${r.productName} | ${r.correctedSiteCode} | ${r.date}`);
  });
  console.log(`... and ${createdRecords.length - 5} more.`);
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
