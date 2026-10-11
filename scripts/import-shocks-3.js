const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Shock Absorber Tracks (کمک۳.csv) ---');

  const pyCode = `
import csv, re, json

with open('tracks/کمک۳.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

parent_map = {r['شناسه']: r for r in rows if r['نوع'] == 'variable'}
variations_by_parent = {}
for r in rows:
    if r['نوع'] == 'variation':
        pid = r['مادر'].replace('id:', '').strip()
        variations_by_parent.setdefault(pid, []).append(r)

def normalize_brand(b):
    b = b.strip()
    if 'cariso' in b.lower():
        return 'Cariso Tech'
    if 'ctr' in b.lower():
        return 'CTR'
    if 'mando' in b.lower():
        return 'MANDO'
    if 'barous' in b.lower():
        return 'Barous'
    if 'china' in b.lower():
        return 'China'
    if 'mobis' in b.lower():
        return 'MOBIS'
    if 'kyb' in b.lower():
        return 'KYB'
    if 'best' in b.lower():
        return 'BEST'
    if 'dyc' in b.lower():
        return 'DYC'
    if 'mb' in b.lower() and 'korea' in b.lower():
        return 'MB KOREA'
    if b.lower() in ['korea', 'کره']:
        return 'Korea'
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
        raw_brand = ''
        if table_m:
            table = table_m.group(0)
            m = re.search(r'برند\s*</td>.*?<td[^>]*>(?:<span[^>]*>)?([^<]+)', table, re.DOTALL)
            raw_brand = m.group(1).strip() if m else ''
        
        if not raw_brand:
            for col in r:
                if col.startswith('نام ') and r[col] == 'برند':
                    num = col.split()[1]
                    raw_brand = r.get(f'مقدار(های) {num} صفت', '').strip()
        
        if not raw_brand:
            for b_candidate in ['MB KOREA', 'Cariso Tech', 'CTR', 'MANDO', 'Barous', 'KYB', 'MOBIS', 'BEST', 'DYC']:
                if b_candidate.lower() in name.lower():
                    raw_brand = b_candidate
                    break
        if not raw_brand:
            raw_brand = 'Cariso Tech'
            
        brand = normalize_brand(raw_brand)
        link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
        
        direction = 'شهریور'
        if 'چپ' in name:
            direction = 'چپ'
        elif 'راست' in name:
            direction = 'راست'
            
        items.append({
            'productName': name,
            'brand': brand,
            'correctedSiteCode': sku,
            'link': link,
            'date': '1405/06/02',
            'description': direction,
            '_orig_id': id_
        })
    elif t == 'variable':
        vars_ = variations_by_parent.get(id_, [])
        base_name = r['نام'].strip()
        
        p_brand = ''
        for col in r:
            if col.startswith('نام ') and r[col] == 'برند':
                num = col.split()[1]
                p_brand = r.get(f'مقدار(های) {num} صفت', '').strip()
                
        for v in vars_:
            v_sku = v['شناسه محصول'].strip()
            # Special check for ID 17530 whose SKU is 54651JACS5 (left shock of Jac S5)
            if not v_sku and v['شناسه'] == '17530':
                v_sku = '54651JACS5'
                
            v_brand = ''
            v_dir = ''
            for col in v:
                if col.startswith('نام '):
                    num = col.split()[1]
                    attr_name = v[col].strip()
                    attr_val = v.get(f'مقدار(های) {num} صفت', '').strip()
                    if attr_name == 'برند':
                        v_brand = attr_val
                    elif attr_name == 'جهت':
                        v_dir = attr_val
                        
            if not v_dir:
                if 'چپ' in v['نام']:
                    v_dir = 'چپ'
                elif 'راست' in v['نام']:
                    v_dir = 'راست'
                        
            final_brand = normalize_brand(v_brand or p_brand or 'CTR')
            final_desc = v_dir if v_dir else 'شهریور'
            v_link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
            
            items.append({
                'productName': base_name,
                'brand': final_brand,
                'correctedSiteCode': v_sku,
                'link': v_link,
                'date': '1405/06/02',
                'description': final_desc,
                '_orig_id': v['شناسه'],
                '_parent_id': id_
            })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync(`python3 -c "${pyCode.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from کمک۳.csv.`);

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
    console.log(`${idx + 1}. [${r.id}] [${r.brand}] ${r.productName} | ${r.correctedSiteCode} | ${r.description} | ${r.date}`);
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
