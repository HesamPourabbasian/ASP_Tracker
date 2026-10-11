const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Bushing Tracks (بوش.csv) ---');

  const pyCode = `
import csv, re, json

def normalize_brand(b, name='', sku=''):
    b = (b or '').strip()
    bl = b.lower()
    
    if 'cariso' in bl:
        return 'Cariso Tech'
    if 'febest' in bl:
        return 'FEBEST'
    if 'schmaco' in bl:
        return 'Schmaco'
    if 'ctr' in bl or 'سی تی ار' in bl:
        return 'CTR'
    if 'tiwan' in bl:
        return 'TIWAN'
    if 'rbi' in bl:
        return 'RBI'
    if bl == 'ph' or 'ph' in bl.split('/'):
        return 'PH'
    if bl == 'sh' or 'sh' in bl.split('/'):
        return 'SH'
    if 'pya' in bl:
        return 'PYA'
    if 'mobis' in bl or 'موبیس' in bl:
        return 'MOBIS'
    if 'mando' in bl:
        return 'MANDO'
    if 'genuine' in bl or 'جنیون' in bl:
        return 'Genuine'
    return b

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

with open('tracks/بوش.csv', encoding='utf-8-sig') as f:
    rows = list(csv.DictReader(f))

variations_by_parent_id = {}
for r in rows:
    if r['نوع'] == 'variation':
        pid = r['مادر'].replace('id:', '').strip()
        variations_by_parent_id.setdefault(pid, []).append(r)

items = []
for r in rows:
    t = r['نوع']
    id_ = r['شناسه']
    if t == 'simple':
        name = r['نام'].strip()
        sku = r['شناسه محصول'].strip()
        desc = r.get('توضیحات', '') or ''
        tb = extract_table_brand(desc)
        b_col = r.get('برندها', '').strip()
        raw_brand = b_col or tb
        brand = normalize_brand(raw_brand, name, sku)
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
            'date': '1405/07/12',
            'description': direction,
            '_orig_id': id_
        })
    elif t == 'variable':
        vars_ = variations_by_parent_id.get(id_, [])
        base_name = r['نام'].strip()
        p_brand = r.get('برندها', '').strip()
        if not p_brand:
            tb = extract_table_brand(r.get('توضیحات', '') or '')
            if tb and tb != '[برند]':
                p_brand = tb
                
        for v in vars_:
            v_sku = v['شناسه محصول'].strip()
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
                    
            final_brand = normalize_brand(v_brand or p_brand, base_name, v_sku)
            final_desc = v_dir if v_dir else 'مهر'
            v_link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
            items.append({
                'productName': base_name,
                'brand': final_brand,
                'correctedSiteCode': v_sku,
                'link': v_link,
                'date': '1405/07/12',
                'description': final_desc,
                '_orig_id': v['شناسه'],
                '_parent_id': id_
            })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync('python3', { input: pyCode, encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from بوش.csv.`);

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
