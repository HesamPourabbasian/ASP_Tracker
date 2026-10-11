const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Brake Pads (لنت۱.csv & لنت۲.csv) ---');

  const pyCode = `
import csv, re, json

def normalize_brand(b):
    b = b.strip()
    bl = b.lower()
    if 'cariso' in bl:
        return 'Cariso Tech'
    if 'ctr' in bl:
        return 'CTR'
    if 'mando' in bl:
        return 'MANDO'
    if 'barous' in bl:
        return 'Barous'
    if 'china' in bl:
        return 'China'
    if 'mobis' in bl:
        return 'MOBIS'
    if 'kyb' in bl:
        return 'KYB'
    if 'best' in bl:
        return 'BEST'
    if 'dyc' in bl:
        return 'DYC'
    if 'genuine' in bl or 'جنیون' in bl:
        return 'Genuine'
    if 'pya' in bl:
        return 'PYA'
    if 'schmaco' in bl:
        return 'Schmaco'
    if 'rbi' in bl:
        return 'RBI'
    if 'riw' in bl:
        return 'RIW'
    if 'elig' in bl:
        return 'Elig'
    if 'frexa' in bl:
        return 'FREXA'
    if 'federal' in bl:
        return 'FEDERAL'
    if 'brenta' in bl:
        return 'BRENTA'
    if 'ford' in bl:
        return 'FORD'
    if 'hq' in bl:
        return 'HQ'
    if 'mb' in bl and 'korea' in bl:
        return 'MB KOREA'
    if 'korea' in bl or 'کره' in bl:
        return 'Korea'
    return b

def extract_file(fn):
    with open(fn, encoding='utf-8-sig') as f:
        rows = list(csv.DictReader(f))

    variations_by_parent = {}
    for r in rows:
        if r['نوع'] == 'variation':
            pid = r['مادر'].replace('id:', '').strip()
            variations_by_parent.setdefault(pid, []).append(r)

    items = []
    for r in rows:
        t = r['نوع']
        id_ = r['شناسه']
        if t == 'simple':
            name = r['نام'].strip()
            sku = r['شناسه محصول'].strip()
            desc = r['توضیحات'] or ''
            short_desc = r.get('توضیح کوتاه', '') or ''
            table_m = re.search(r'<table.*?</table>', desc, re.DOTALL)
            raw_brand = ''
            if table_m:
                table = table_m.group(0)
                m = re.search(r'(?:برند|برند سازنده|برند معتبر)\s*</td>.*?<td[^>]*>(?:<strong[^>]*>)?(?:<span[^>]*>)?([^<]+)', table, re.DOTALL)
                raw_brand = m.group(1).strip() if m else ''
            
            if not raw_brand:
                for col in r:
                    if col.startswith('نام ') and r[col] == 'برند':
                        num = col.split()[1]
                        raw_brand = r.get(f'مقدار(های) {num} صفت', '').strip()
            
            if not raw_brand:
                for b_cand in ['CTR', 'HQ', 'FREXA', 'FEDERAL', 'BRENTA', 'Elig', 'FORD', 'Genuine', 'Cariso Tech', 'MOBIS', 'Korea', 'PYA']:
                    if b_cand.lower() in name.lower() or b_cand.lower() in desc.lower() or b_cand.lower() in short_desc.lower():
                        raw_brand = b_cand
                        break
            brand = normalize_brand(raw_brand or 'CTR')
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
            p_brand = ''
            for col in r:
                if col.startswith('نام ') and r[col] == 'برند':
                    num = col.split()[1]
                    p_brand = r.get(f'مقدار(های) {num} صفت', '').strip()
            for v in vars_:
                v_sku = v['شناسه محصول'].strip()
                v_brand = ''
                for col in v:
                    if col.startswith('نام '):
                        num = col.split()[1]
                        attr_name = v[col].strip()
                        attr_val = v.get(f'مقدار(های) {num} صفت', '').strip()
                        if attr_name == 'برند':
                            v_brand = attr_val
                final_brand = normalize_brand(v_brand or p_brand or 'CTR')
                v_link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
                items.append({
                    'productName': base_name,
                    'brand': final_brand,
                    'correctedSiteCode': v_sku,
                    'link': v_link,
                    'date': '1405/06/02',
                    'description': 'شهریور',
                    '_orig_id': v['شناسه'],
                    '_parent_id': id_
                })
    return items

items1 = extract_file('tracks/لنت۱.csv')
items2 = extract_file('tracks/لنت۲.csv')
print(json.dumps({'items1': items1, 'items2': items2}, ensure_ascii=False))
`;

  const output = execSync(`python3 -c "${pyCode.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  const data = JSON.parse(output);
  const items1 = data.items1;
  const items2 = data.items2;

  console.log(`Prepared ${items1.length} tracks from لنت۱.csv and ${items2.length} tracks from لنت۲.csv.`);

  // First import لنت۱.csv
  let baseTime = Date.now();
  const created1 = [];
  for (let i = items1.length - 1; i >= 0; i--) {
    const item = items1[i];
    const offset = (items1.length - 1 - i) * 50;
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
    created1.unshift(record);
  }
  console.log(`Successfully created ${created1.length} records from لنت۱.csv!`);

  // Next import لنت۲.csv with later timestamps
  baseTime = Date.now() + 5000;
  const created2 = [];
  for (let i = items2.length - 1; i >= 0; i--) {
    const item = items2[i];
    const offset = (items2.length - 1 - i) * 50;
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
    created2.unshift(record);
  }
  console.log(`Successfully created ${created2.length} records from لنت۲.csv!`);
}

main()
  .catch((e) => {
    console.error('Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
