const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Import of Brake Pads (لنت۴.csv) ---');

  const pyCode = `
import csv, re, json

def normalize_brand(b):
    b = b.strip()
    bl = b.lower()
    if 'cariso' in bl:
        return 'Cariso Tech'
    if 'ctr' in bl or 'سی تی ار' in bl:
        return 'CTR'
    if 'mando' in bl:
        return 'MANDO'
    if 'barous' in bl:
        return 'Barous'
    if 'china' in bl:
        return 'China'
    if 'mobis' in bl or 'موبیس' in bl:
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
    if 'hq' in bl or 'hi-q' in bl or 'های کیو' in bl:
        return 'HQ'
    if 'veka' in bl:
        return 'VEKA'
    if 'hyundai brake' in bl:
        return 'Hyundai Brake'
    if 'feodo' in bl or 'ferodo' in bl:
        return 'FERODO'
    if 'mb' in bl and 'korea' in bl:
        return 'MB KOREA'
    if 'korea' in bl or 'کره' in bl:
        return 'Korea'
    return b

with open('tracks/لنت۴.csv', encoding='utf-8-sig') as f:
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
        
        raw_brand = ''
        if 'hyundai brake' in name.lower():
            raw_brand = 'Hyundai Brake'
        elif 'korea star' in name.lower():
            raw_brand = 'Korea'
        elif 'ctr' in name.lower() or 'سی تی ار' in name.lower():
            raw_brand = 'CTR'
        elif 'genuine' in name.lower():
            raw_brand = 'Genuine'
            
        if not raw_brand:
            table_m = re.search(r'<table.*?</table>', desc, re.DOTALL)
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
            for b_cand in ['CTR', 'سی تی ار', 'موبیس', 'MOBIS', 'Hyundai Brake', 'GENUINE', 'KOREA STAR', 'HQ', 'Hi-Q', 'FREXA', 'FEDERAL', 'BRENTA', 'Elig', 'FORD', 'Genuine', 'Cariso Tech', 'Korea', 'PYA', 'FEODO']:
                if b_cand.lower() in name.lower() or b_cand.lower() in desc.lower() or b_cand.lower() in short_desc.lower():
                    raw_brand = b_cand
                    break
        brand = normalize_brand(raw_brand or 'CTR')
        link = f'https://aspart.ir/wp-admin/post.php?post={id_}&action=edit'
        
        direction = 'شهریور'
        if 'چپ' in name or ' LH' in name or name.endswith('LH'):
            direction = 'چپ'
        elif 'راست' in name or ' RH' in name or name.endswith('RH'):
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
            if not v_sku and v['شناسه'] == '17210':
                v_sku = '581012SA70'
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
            
            direction = 'شهریور'
            if 'چپ' in v['نام'] or ' LH' in v['نام'] or v['نام'].endswith('LH'):
                direction = 'چپ'
            elif 'راست' in v['نام'] or ' RH' in v['نام'] or v['نام'].endswith('RH'):
                direction = 'راست'
                
            items.append({
                'productName': base_name,
                'brand': final_brand,
                'correctedSiteCode': v_sku,
                'link': v_link,
                'date': '1405/06/02',
                'description': direction,
                '_orig_id': v['شناسه'],
                '_parent_id': id_
            })

print(json.dumps(items, ensure_ascii=False))
`;

  const output = execSync(`python3 -c "${pyCode.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
  const items = JSON.parse(output);

  console.log(`Prepared ${items.length} tracks to insert from لنت۴.csv.`);

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
