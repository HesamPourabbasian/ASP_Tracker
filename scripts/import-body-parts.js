const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Body Part Tracks (بدنه .csv) ---');

  const pyCode = `
import csv, re, json

with open('tracks/بدنه .csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

variations_by_parent_id = {}
for r in rows:
    if r['نوع'] == 'variation':
        pid = r['مادر'].replace('id:', '').strip()
        variations_by_parent_id.setdefault(pid, []).append(r)

def normalize_brand(b):
    b = (b or '').strip().lower()
    if 'genuine' in b or 'geniune' in b or 'جنیون' in b:
        return 'Genuine'
    return 'Genuine'

items = []
for r in rows:
    t = r['نوع']
    id_ = r['شناسه']
    if t == 'simple':
        name = r['نام'].strip()
        sku = r['شناسه محصول'].strip()
        brand = normalize_brand(r.get('برندها', ''))
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
            'date': '1405/07/15',
            'description': direction,
            '_orig_id': id_
        })
    elif t == 'variable':
        vars_ = variations_by_parent_id.get(id_, [])
        base_name = r['نام'].strip()
        p_brand = normalize_brand(r.get('برندها', ''))
        for v in vars_:
            v_sku = v['شناسه محصول'].strip()
            v_dir = ''
            for col in v:
                if col and col.startswith('نام '):
                    num = col.split()[1]
                    attr_name = (v[col] or '').strip()
                    attr_val = (v.get(f'مقدار(های) {num} صفت') or '').strip()
                    if attr_name == 'جهت':
                        v_dir = attr_val
            if not v_dir:
                if 'چپ' in v['نام']:
                    v_dir = 'چپ'
                elif 'راست' in v['نام']:
                    v_dir = 'راست'
            final_desc = v_dir if v_dir in ['چپ', 'راست'] else ('چپ' if 'چپ' in base_name else ('راست' if 'راست' in base_name else 'مهر'))
            v_link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
            items.append({
                'productName': base_name,
                'brand': p_brand,
                'correctedSiteCode': v_sku,
                'link': v_link,
                'date': '1405/07/15',
                'description': final_desc,
                '_orig_id': v['شناسه'],
                '_parent_id': id_
            })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync('python3', { input: pyCode, encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from بدنه .csv.`);

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
